import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import axios from "axios";
import Pusher from "pusher";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Pusher configuration
const pusher = new Pusher({
    appId: "1959139",
    key: "af98277e22dd8b41a76e",
    secret: "5e235a4c5e3044ead77d",
    cluster: "ap1",
    useTLS: true,
});

// Express app setup
const app = express();
const port = process.env.PORT || 3000;
const tahunAkademik = "2024/2025";
const semester = "2";

// Track active jobs
const jobs: { [username: string]: boolean } = {};

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "./client/dist")));

// API endpoint for presensi
app.post("/api/presensi", async (req: Request, res: Response) => {
    let { username, password }: { username: string; password: string } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "Username dan password diperlukan" });
        return;
    }

    username = username.toUpperCase();

    if (jobs[username]) {
        await pusher.trigger(username, "presensi-status", {
            status: "warning",
            message: "Melanjutkan proses sebelumnya",
            username: username,
        });
        res.status(200).json({ message: "Melanjutkan proses sebelumnya" });
        return;
    }

    jobs[username] = true;

    await pusher.trigger(username, "presensi-status", {
        status: "success",
        message: "Memulai proses presensi...",
    });

    try {
        presensi(username, password).catch(async error => {
            console.error("Error dalam presensi:", error);

            if (jobs[username]) {
                await pusher.trigger(username, "presensi-status", {
                    status: "error",
                    message: "Terjadi kesalahan dalam proses presensi",
                });

                delete jobs[username];
            }
        });

        res.json({ status: "processing", message: "Proses presensi sedang berjalan" });
    } catch (error) {
        delete jobs[username];
        res.status(500).json({ status: "error", message: "Terjadi kesalahan server" });
    }
});

// Serve React app for all other routes
app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

// Start server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

// Main presensi function
async function presensi(user: string, pass: string) {
    let sessionId = uuidv4();

    try {
        await sendStatusUpdate(user, {
            id: sessionId,
            status: "loading",
            message: "Sedang login ke sistem...",
        });

        const data = `pengguna=${user}&passw=${pass}`;
        const response = await axios.post("https://student.amikompurwokerto.ac.id/auth/toenter", data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        await sendStatusUpdate(user, {
            id: sessionId,
            status: "success",
            message: "Sedang login ke sistem...",
        });

        await delay(200);

        if (response.data && String(response.data)?.includes("PERIKSA KEMBALI NAMA PENGGUNA DAN PASSWORD ANDA")) {
            await sendStatusUpdate(user, {
                status: "error",
                message: "Login gagal! Periksa kembali username dan password Anda.",
            });
            delete jobs[user];
            return;
        }

        const cookie = response.headers["set-cookie"]?.find(f => f.includes("ci_session="))?.match(/(^ci_session=.+?);/)?.[1];

        if (!cookie) {
            await sendStatusUpdate(user, {
                status: "error",
                message: "Tidak dapat memperoleh cookie sesi",
            });
            delete jobs[user];
            return;
        }

        sessionId = uuidv4();
        await sendStatusUpdate(user, {
            id: sessionId,
            status: "progress",
            message: "Login berhasil! Mengambil daftar mata kuliah...",
        });

        const unValidated = await getUnvalidatedCourses(cookie);

        await sendStatusUpdate(user, {
            id: sessionId,
            status: "success",
            message: "Login berhasil! Mengambil daftar mata kuliah...",
        });

        if (unValidated.length === 0) {
            await sendStatusUpdate(user, {
                status: "done",
                message: "Tidak ada mata kuliah yang perlu divalidasi.",
            });
            delete jobs[user];
            return;
        }

        await sendStatusUpdate(user, {
            status: "success",
            message: `Ditemukan ${unValidated.length} mata kuliah yang perlu divalidasi`,
            courses: unValidated,
        });

        sessionId = uuidv4();
        for (let i = 0; i < unValidated.length; i++) {
            const course = unValidated[i];

            await sendStatusUpdate(user, {
                id: sessionId,
                status: "progress",
                message: `Memproses mata kuliah (${i + 1}/${unValidated.length}): ${course.makul}`,
                currentCourse: course,
                progress: { current: i + 1, total: unValidated.length },
            });

            try {
                await validasi(cookie, course.id, user);

                await sendStatusUpdate(user, {
                    status: "success",
                    message: `Berhasil validasi mata kuliah: ${course.makul}`,
                    completedCourse: course,
                });
            } catch (error) {
                if (!(error instanceof Error)) return;

                await sendStatusUpdate(user, {
                    status: "warning",
                    message: `Gagal validasi mata kuliah: ${course.makul}`,
                    failedCourse: course,
                    error: error.message,
                });
            }

            await delay(900);

            if (i == unValidated.length - 1) {
                await sendStatusUpdate(user, {
                    id: sessionId,
                    status: "success",
                    message: `Memproses mata kuliah (${i + 1}/${unValidated.length}): ${course.makul}`,
                    currentCourse: course,
                    progress: { current: i + 1, total: unValidated.length },
                });
            }
        }

        await sendStatusUpdate(user, {
            status: "success",
            message: `Selesai memproses ${unValidated.length} mata kuliah`,
            completedCourses: unValidated,
        });

        delete jobs[user];
    } catch (error) {
        if (!(error instanceof Error)) return;

        if (jobs[user]) {
            await sendStatusUpdate(user, {
                status: "error",
                message: `Terjadi kesalahan: ${error.message}`,
            });

            delete jobs[user];
        }
    }
}

// Helper function to get unvalidated courses
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

// Function to handle validation for each course
async function validasi(cookie: string, idMakul: string, username: string) {
    const sessionId = uuidv4();

    await sendDetailUpdate(username, {
        id: sessionId,
        status: "progress",
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
        await sendDetailUpdate(username, {
            id: sessionId,
            status: "warning",
            message: "Tidak ada data presensi yang perlu divalidasi",
        });
        return { status: "no_data", message: "Tidak ada data presensi yang perlu divalidasi" };
    }

    await sendDetailUpdate(username, {
        id: sessionId,
        status: "success",
        message: `Ditemukan ${ids.length} presensi yang perlu divalidasi`,
    });

    const results: { [key: string]: string }[] = [];
    for (const v of ids) {
        const itemId = uuidv4();

        await sendDetailUpdate(username, {
            id: itemId,
            status: "progress",
            message: `Memproses validasi presensi: ${v.namaMakul} (${v.jenisKuliah})`,
        });

        try {
            const result = await clickValidasi(cookie, v.id, v.teori, v.praktek, v.jenisKuliah);
            results.push(result);

            await sendDetailUpdate(username, {
                id: itemId,
                status: "success",
                message: `Selesai validasi presensi: ${v.namaMakul} (${v.jenisKuliah})`,
            });
        } catch (error) {
            if (error instanceof Error) {
                await sendDetailUpdate(username, {
                    id: itemId,
                    status: "error",
                    message: `Gagal validasi presensi: ${v.namaMakul} (${v.jenisKuliah}) - ${error.message}`,
                });
            }
        }
    }

    await sendDetailUpdate(username, {
        id: sessionId,
        status: "done",
        message: `Selesai validasi ${ids.length} presensi`,
    });

    return { status: "success", message: "Berhasil validasi semua presensi", results };
}

// Function to handle the validation click action
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

// Helper functions
async function sendStatusUpdate(username: string, data: any) {
    try {
        await pusher.trigger(username, "presensi-status", data);
    } catch (error) {
        console.error("Error sending status update:", error);
    }
}

async function sendDetailUpdate(username: string, data: any) {
    try {
        await pusher.trigger(username, "presensi-detail", data);

        // Duplicate important updates to presensi-status to ensure client receives them
        if (data.status === "error" || data.status === "warning" || data.status === "success") {
            await pusher.trigger(username, "presensi-status", data);
        }
    } catch (error) {
        console.error("Error sending detail update:", error);
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
