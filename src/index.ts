import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import axios from "axios";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Server, Socket } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const port = process.env.PORT || 3000;
const tahunAkademik = "2024/2025";
const semester = "2";

const jobs: { [username: string]: boolean } = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client1/dist")));

app.post("/api/presensi", async (req: Request, res: Response) => {
    let { username, password }: { username: string; password: string } = req.body;

    if (!username || !password) {
        res.sendStatus(400);
        return;
    }

    username = username.toUpperCase();

    if (jobs[username]) {
        sendMessage(username, { status: "loading", message: "Melanjutkan proses sebelumnya" });
        res.sendStatus(200);
        return;
    }

    jobs[username] = true;

    sendMessage(username, { status: "success", message: "Memulai presensi" });

    try {
        presensi(username, password).catch(async error => {
            console.error("Error dalam presensi:", error);

            if (jobs[username]) {
                sendMessage(username, { status: "error", message: "Terjadi kesalahan dalam proses presensi" });

                delete jobs[username];
            }
        });

        res.sendStatus(200);
    } catch (error) {
        delete jobs[username];
        res.sendStatus(500);
    }
});

app.get("*", (_req, res) => {
    return res.sendFile(path.join(__dirname, "../client1/dist/index.html"));
});

server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

async function presensi(user: string, pass: string) {
    try {
        let id: string;
        id = sendMessage(user, { status: "loading", message: "Sedang login ke sistem" });

        const data = `pengguna=${user}&passw=${pass}`;
        const response = await axios.post("https://student.amikompurwokerto.ac.id/auth/toenter", data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        sendMessage(user, { id, status: "success", message: "Sedang login ke sistem" });

        if (response.data && String(response.data)?.includes("PERIKSA KEMBALI NAMA PENGGUNA DAN PASSWORD ANDA")) {
            sendMessage(user, { status: "error", message: "Login gagal! Periksa kembali username dan password Anda." });
            delete jobs[user];
            return;
        }

        const cookie = response.headers["set-cookie"]?.find(f => f.includes("ci_session="))?.match(/(^ci_session=.+?);/)?.[1];

        if (!cookie) {
            sendMessage(user, { status: "error", message: "Tidak dapat memperoleh cookie sesi" });
            delete jobs[user];
            return;
        }

        id = sendMessage(user, { status: "loading", message: "Login berhasil! Mengambil daftar mata kuliah..." });

        const unValidated = await getUnvalidatedCourses(cookie);

        sendMessage(user, { id, status: "success", message: "Login berhasil! Mengambil daftar mata kuliah..." });

        if (unValidated.length === 0) {
            sendMessage(user, { status: "success", message: "Tidak ada mata kuliah yang perlu divalidasi." });
            delete jobs[user];
            return;
        }

        sendMessage(user, {
            status: "success",
            message: `Ditemukan ${unValidated.length} mata kuliah yang perlu divalidasi`,
        });

        for (let i = 0; i < unValidated.length; i++) {
            const course = unValidated[i];

            id = sendMessage(user, {
                status: "loading",
                message: `Memproses mata kuliah (${i + 1}/${unValidated.length}): ${course.makul}`,
            });

            try {
                await validasi(cookie, course.id, user);

                sendMessage(user, {
                    status: "success",
                    message: `- Berhasil validasi mata kuliah: ${course.makul}`,
                });
            } catch (error) {
                if (!(error instanceof Error)) return;

                sendMessage(user, {
                    status: "warning",
                    message: `- Gagal validasi mata kuliah: ${course.makul}`,
                });
            }

            if (i == unValidated.length - 1) {
                sendMessage(user, {
                    id,
                    status: "success",
                    message: `Memproses mata kuliah (${i + 1}/${unValidated.length}): ${course.makul}`,
                });
            }
        }

        sendMessage(user, {
            status: "success",
            message: `Selesai memproses ${unValidated.length} mata kuliah`,
        });

        delete jobs[user];
    } catch (error) {
        if (!(error instanceof Error)) return;

        if (jobs[user]) {
            sendMessage(user, {
                status: "error",
                message: `Terjadi kesalahan: ${error.message}`,
            });

            delete jobs[user];
        }
    }
}

async function getUnvalidatedCourses(cookie: string) {
    const [resp1, resp2] = await Promise.all([
        axios.post(
            "https://student.amikompurwokerto.ac.id/pembelajaran/list_makul_belum_validasi",
            {},
            {
                headers: {
                    Cookie: cookie,
                },
            }
        ),
        axios.post("https://student.amikompurwokerto.ac.id/pembelajaran/getmakul", `thn_akademik=${tahunAkademik}&semester=${semester}`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: cookie,
            },
        }),
    ]);

    const makulMap: [string, string][] = [];
    const $ = cheerio.load(resp2.data);
    $("option").each((_, el) => {
        const val = $(el).attr("value");
        if (!val) return;
        const text = $(el).text();
        makulMap.push([val, text]);
    });
    const result: { id: string; makul: string; count: number }[] = [];
    for (let v of Object.keys(resp1.data)) {
        for (let p of makulMap) {
            if (p[0].includes(v)) {
                result.push({ id: p[0], makul: p[1], count: resp1.data[v].count });
                break;
            }
        }
    }
    return result;
}

async function validasi(cookie: string, idMakul: string, username: string) {
    let id = sendMessage(username, {
        status: "loading",
        message: `Mengambil data presensi...`,
    });

    const response = await axios.post(
        "https://student.amikompurwokerto.ac.id/pembelajaran/getabsenmhs",
        new URLSearchParams({
            thn_akademik: tahunAkademik,
            semester,
            makul: idMakul,
        }).toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: cookie,
            },
        }
    );

    const $ = cheerio.load(response.data);
    const ids: { id: string; namaMakul: string; teori: string; praktek: string; jenisKuliah: string }[] = [];
    $("a.btn-sm.btn-primary").each((_, el) => {
        const js = $(el).attr("onclick");
        const params = js?.match(/edit_presensikehadiran\((.+?)\)/)?.[1];
        if (!params) return;
        const [id, namaMakul, teori, praktek, jenisKuliah] = params.split(",").map(p => p.trim().replace(/^'|'$/g, ""));

        ids.push({ id, namaMakul, teori, praktek, jenisKuliah });
    });

    if (ids.length === 0) {
        sendMessage(username, {
            status: "success",
            message: "Tidak ada data presensi yang perlu divalidasi",
        });
        return { status: "no_data", message: "Tidak ada data presensi yang perlu divalidasi" };
    }

    sendMessage(username, {
        status: "success",
        message: `Ditemukan ${ids.length} presensi yang perlu divalidasi`,
    });

    const results: { [key: string]: string }[] = [];
    for (const v of ids) {
        let id = sendDetailMessage(username, {
            status: "loading",
            message: `Memproses validasi presensi: ${v.namaMakul} (${v.jenisKuliah})`,
        });

        try {
            const result = await clickValidasi(cookie, v.id, v.teori, v.praktek, v.jenisKuliah);
            results.push(result);

            sendDetailMessage(username, {
                id,
                status: "success",
                message: `Selesai validasi presensi: ${v.namaMakul} (${v.jenisKuliah})`,
            });
        } catch (error) {
            if (error instanceof Error) {
                sendDetailMessage(username, {
                    id,
                    status: "error",
                    message: `Gagal validasi presensi: ${v.namaMakul} (${v.jenisKuliah}) - ${error.message}`,
                });
            }
        }
    }

    sendDetailMessage(username, {
        status: "success",
        message: `Selesai validasi ${ids.length} presensi`,
    });

    return { status: "success", message: "Berhasil validasi semua presensi", results };
}

async function clickValidasi(cookie: string, id: string, teori: string, praktek: string, jenisKuliah: string) {
    const response = await axios("https://student.amikompurwokerto.ac.id/pembelajaran/ajax_editpresensi/" + id, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookie,
        },
    });

    const id_presensi_mhs = response.data.id_presensi_mhs;
    const id_presensi_dosen = response.data.id_presensi_dosen;

    const form: { [key: string]: string } = {};

    form["jenispilih"] = jenisKuliah;
    form["idpresensimhstexs"] = id_presensi_mhs;
    form["idpresensidosen"] = id_presensi_dosen;
    form["kuliahteori"] = teori;
    form["kuliahpraktek"] = praktek;
    form["kesesuaian_perkuliahan"] = "1";
    form["kesesuaian_materi"] = "1";
    form["penilaianmhs"] = "4";
    form["kritiksaran"] = "";

    if (jenisKuliah == "praktek") {
        let i = -1;
        for (let v of response.data.asdoss) {
            i++;
            form["asdos_npms[]"] = v.npm;
            form[`asdospenilaian_${i}_1`] = "1";
            form[`asdospenilaian_${i}_2`] = "5";
            form[`asdospenilaian_${i}_3`] = "9";
            form[`asdospenilaian_${i}_4`] = "13";
        }
    }

    const resp2 = await axios.post("https://student.amikompurwokerto.ac.id/pembelajaran/update_presensimhs", new URLSearchParams(form).toString(), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookie,
        },
    });

    return resp2.data;
}

function sendDetailMessage(username: string, data: Message & { id?: string }) {
    let id = data.id ?? uuidv4();
    io.emit(username + "-detail", data);
    return id;
}

interface Message {
    status: "loading" | "success" | "error" | "warning";
    message: string;
}

function sendMessage(user: string, { id, status, message }: Message & { id?: string }) {
    id = id ?? uuidv4();
    io.emit(user, { id, status, message });
    return id;
}
