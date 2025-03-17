"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const pusher_1 = __importDefault(require("pusher"));
const path_1 = __importDefault(require("path"));
const pusher = new pusher_1.default({
    appId: "1959139",
    key: "af98277e22dd8b41a76e",
    secret: "5e235a4c5e3044ead77d",
    cluster: "ap1",
    useTLS: true,
});
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const tahunAkademik = "2024/2025";
const semester = "2";
// Penyimpanan proses yang sedang berjalan
const activeProcesses = {};
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "./client/dist")));
app.post("/api/presensi", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ status: "error", message: "Username dan password diperlukan" });
        return;
    }
    // Cek apakah proses dengan username ini sedang berjalan
    if (activeProcesses[username]) {
        // Hentikan proses sebelumnya dengan memberi tahu client
        pusher.trigger(`presensi-channel-${username}`, "presensi-status", {
            status: "warning",
            message: "Proses sebelumnya dihentikan karena ada permintaan baru",
            username: username,
        });
        // Tandai proses sebelumnya sebagai tidak aktif
        activeProcesses[username] = false;
    }
    // Tandai proses ini sebagai aktif
    activeProcesses[username] = true;
    // Trigger pesan loading ke channel khusus username
    pusher.trigger(`presensi-channel-${username}`, "presensi-status", {
        status: "loading",
        message: "Memulai proses presensi...",
        username: username,
    });
    try {
        // Lakukan presensi secara asinkron
        presensi(username, password).catch(error => {
            console.error("Error dalam presensi:", error);
            // Cek apakah proses ini masih aktif sebelum mengirim pesan error
            if (activeProcesses[username]) {
                pusher.trigger(`presensi-channel-${username}`, "presensi-status", {
                    status: "error",
                    message: "Terjadi kesalahan dalam proses presensi",
                    error: error.message,
                    username: username,
                });
                // Tandai proses ini sebagai tidak aktif
                activeProcesses[username] = false;
            }
        });
        // Kembalikan respons segera
        res.json({ status: "processing", message: "Proses presensi sedang berjalan" });
    }
    catch (error) {
        // Tandai proses ini sebagai tidak aktif jika terjadi error
        activeProcesses[username] = false;
        res.status(500).json({ status: "error", message: "Terjadi kesalahan server" });
    }
}));
app.get("*", (req, res) => {
    return res.sendFile(path_1.default.join(__dirname, "./client/dist/index.html"));
});
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
function presensi(user, pass) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            // Kirim pesan loading login
            pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                status: "loading",
                message: "Sedang login ke sistem...",
                username: user,
            });
            // Cek apakah proses ini masih aktif
            if (!activeProcesses[user])
                return;
            const data = `pengguna=${user}&passw=${pass}`;
            const response = yield axios_1.default.post("https://student.amikompurwokerto.ac.id/auth/toenter", data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            // Cek apakah login berhasil
            if (response.data && ((_a = String(response.data)) === null || _a === void 0 ? void 0 : _a.includes("PERIKSA KEMBALI NAMA PENGGUNA DAN PASSWORD ANDA"))) {
                pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                    status: "error",
                    message: "Login gagal! Periksa kembali username dan password Anda.",
                    username: user,
                });
                activeProcesses[user] = false;
                return;
            }
            const cookie = (_d = (_c = (_b = response.headers["set-cookie"]) === null || _b === void 0 ? void 0 : _b.find(f => f.includes("ci_session="))) === null || _c === void 0 ? void 0 : _c.match(/(^ci_session=.+?);/)) === null || _d === void 0 ? void 0 : _d[1];
            if (!cookie) {
                pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                    status: "error",
                    message: "Tidak dapat memperoleh cookie sesi",
                    username: user,
                });
                activeProcesses[user] = false;
                return;
            }
            // Cek apakah proses ini masih aktif
            if (!activeProcesses[user])
                return;
            // Kirim pesan berhasil login
            pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                status: "progress",
                message: "Login berhasil! Mengambil daftar mata kuliah...",
                username: user,
            });
            // Ambil matakuliah yang belum divalidasi
            const unValidated = yield getUnvalidatedCourses(cookie);
            // Cek apakah proses ini masih aktif
            if (!activeProcesses[user])
                return;
            if (unValidated.length === 0) {
                pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                    status: "success",
                    message: "Tidak ada mata kuliah yang perlu divalidasi.",
                    username: user,
                });
                activeProcesses[user] = false;
                return;
            }
            // Kirim pesan jumlah mata kuliah yang perlu divalidasi
            pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                status: "progress",
                message: `Ditemukan ${unValidated.length} mata kuliah yang perlu divalidasi`,
                courses: unValidated,
                username: user,
            });
            // Proses validasi satu per satu
            for (let i = 0; i < unValidated.length; i++) {
                // Cek apakah proses ini masih aktif
                if (!activeProcesses[user])
                    return;
                const course = unValidated[i];
                // Kirim pesan sedang memproses mata kuliah
                pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                    status: "progress",
                    message: `Memproses mata kuliah (${i + 1}/${unValidated.length}): ${course.makul}`,
                    currentCourse: course,
                    progress: {
                        current: i + 1,
                        total: unValidated.length,
                    },
                    username: user,
                });
                try {
                    yield validasi(cookie, course.id, user);
                    // Cek apakah proses ini masih aktif
                    if (!activeProcesses[user])
                        return;
                    // Kirim pesan berhasil validasi mata kuliah
                    pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                        status: "progress",
                        message: `Berhasil validasi mata kuliah: ${course.makul}`,
                        completedCourse: course,
                        progress: {
                            current: i + 1,
                            total: unValidated.length,
                        },
                        username: user,
                    });
                }
                catch (error) {
                    if (!(error instanceof Error))
                        return;
                    // Cek apakah proses ini masih aktif
                    if (!activeProcesses[user])
                        return;
                    // Kirim pesan gagal validasi mata kuliah
                    pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                        status: "warning",
                        message: `Gagal validasi mata kuliah: ${course.makul}`,
                        failedCourse: course,
                        error: error.message,
                        progress: {
                            current: i + 1,
                            total: unValidated.length,
                        },
                        username: user,
                    });
                }
                // Tambahkan delay untuk menghindari rate limiting
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            // Cek apakah proses ini masih aktif
            if (!activeProcesses[user])
                return;
            // Kirim pesan selesai semua
            pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                status: "success",
                message: `Selesai memproses ${unValidated.length} mata kuliah`,
                completedCourses: unValidated,
                username: user,
            });
            // Tandai proses ini sebagai selesai
            activeProcesses[user] = false;
        }
        catch (error) {
            if (!(error instanceof Error))
                return;
            // Cek apakah proses ini masih aktif
            if (activeProcesses[user]) {
                pusher.trigger(`presensi-channel-${user}`, "presensi-status", {
                    status: "error",
                    message: `Terjadi kesalahan: ${error.message}`,
                    username: user,
                });
                // Tandai proses ini sebagai tidak aktif
                activeProcesses[user] = false;
            }
        }
    });
}
function getUnvalidatedCourses(cookie) {
    return __awaiter(this, void 0, void 0, function* () {
        const [resp1, resp2] = yield Promise.all([
            axios_1.default.post("https://student.amikompurwokerto.ac.id/pembelajaran/list_makul_belum_validasi", {}, {
                headers: {
                    Cookie: cookie,
                },
            }),
            axios_1.default.post("https://student.amikompurwokerto.ac.id/pembelajaran/getmakul", `thn_akademik=${tahunAkademik}&semester=${semester}`, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: cookie,
                },
            }),
        ]);
        const makulMap = [];
        const $ = cheerio.load(resp2.data);
        $("option").each((_, el) => {
            const val = $(el).attr("value");
            if (!val)
                return;
            const text = $(el).text();
            makulMap.push([val, text]);
        });
        const result = [];
        for (let v of Object.keys(resp1.data)) {
            for (let p of makulMap) {
                if (p[0].includes(v)) {
                    result.push({ id: p[0], makul: p[1], count: resp1.data[v].count });
                    break;
                }
            }
        }
        return result;
    });
}
function validasi(cookie, idMakul, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post("https://student.amikompurwokerto.ac.id/pembelajaran/getabsenmhs", new URLSearchParams({
            thn_akademik: tahunAkademik,
            semester,
            makul: idMakul,
        }).toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: cookie,
            },
        });
        const $ = cheerio.load(response.data);
        const ids = [];
        $("a.btn-sm.btn-primary").each((_, el) => {
            var _a;
            const js = $(el).attr("onclick");
            const params = (_a = js === null || js === void 0 ? void 0 : js.match(/edit_presensikehadiran\((.+?)\)/)) === null || _a === void 0 ? void 0 : _a[1];
            if (!params)
                return;
            const [id, namaMakul, teori, praktek, jenisKuliah] = params.split(",").map(p => p.trim().replace(/^'|'$/g, ""));
            ids.push({ id, namaMakul, teori, praktek, jenisKuliah });
        });
        if (ids.length === 0) {
            return { status: "no_data", message: "Tidak ada data presensi yang perlu divalidasi" };
        }
        const results = [];
        for (const v of ids) {
            // Cek apakah proses ini masih aktif
            if (!activeProcesses[username])
                return { status: "cancelled", message: "Proses dibatalkan" };
            // Kirim pesan memproses validasi presensi
            pusher.trigger(`presensi-channel-${username}`, "presensi-detail", {
                status: "processing",
                message: `Memproses validasi presensi: ${v.namaMakul} (${v.jenisKuliah})`,
                username: username,
            });
            const result = yield clickValidasi(cookie, v.id, v.teori, v.praktek, v.jenisKuliah);
            results.push(result);
            // Cek apakah proses ini masih aktif
            if (!activeProcesses[username])
                return { status: "cancelled", message: "Proses dibatalkan" };
            // Kirim pesan selesai validasi presensi
            pusher.trigger(`presensi-channel-${username}`, "presensi-detail", {
                status: "completed",
                message: `Selesai validasi presensi: ${v.namaMakul} (${v.jenisKuliah})`,
                username: username,
            });
        }
        return { status: "success", message: "Berhasil validasi semua presensi", results };
    });
}
function clickValidasi(cookie, id, teori, praktek, jenisKuliah) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, axios_1.default)("https://student.amikompurwokerto.ac.id/pembelajaran/ajax_editpresensi/" + id, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: cookie,
            },
        });
        const id_presensi_mhs = response.data.id_presensi_mhs;
        const id_presensi_dosen = response.data.id_presensi_dosen;
        const form = {};
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
                // v.nama untuk nama
                form["asdos_npms[]"] = v.npm;
                form[`asdospenilaian_${i}_1`] = "1";
                form[`asdospenilaian_${i}_2`] = "5";
                form[`asdospenilaian_${i}_3`] = "9";
                form[`asdospenilaian_${i}_4`] = "13";
            }
        }
        const resp2 = yield axios_1.default.post("https://student.amikompurwokerto.ac.id/pembelajaran/update_presensimhs", new URLSearchParams(form).toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: cookie,
            },
        });
        return resp2.data;
    });
}
