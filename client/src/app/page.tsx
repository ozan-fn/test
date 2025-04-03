"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IconAlertTriangle, IconBugFilled, IconCheck, IconLoader2, IconX } from "@tabler/icons-react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Message } from "../types";
import { useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";

const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000";
const playfairDisplay = Playfair_Display({ subsets: ["latin"] });

export default function App() {
	//
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [nim, setNim] = useState("");
	const [password, setPassword] = useState("");
	const [done, setDone] = useState(false);
	const [detailMessages, setDetailMessages] = useState<Message[]>([]);
	const [pAsdos, setPAsdos] = useState<number>(0);
	const [pDosen, setPDosen] = useState<number>(0);

	useEffect(() => {
		setSocket(io(URL));
		if (localStorage.getItem("nim")) {
			setNim(localStorage.getItem("nim")!);
		}

		return function () {
			socket?.disconnect();
		};
	}, []);

	useEffect(() => {
		if (!socket && !nim) return;
		let username = nim.toUpperCase();

		socket?.on(username, (data: Message) => {
			setMessages((prev) => {
				const msgIndex = prev.findIndex((msg) => msg.id === data.id);
				if (msgIndex !== -1) {
					const updated = [...prev];
					updated[msgIndex] = { ...prev[msgIndex], ...data };
					return [...updated];
				}
				return [...prev, data];
			});

			if (data.status === "success" && (data.message?.includes("Selesai memproses") || data.message?.includes("Tidak ada mata kuliah") || data.message?.includes("validasi mata kuliah"))) {
				setDone(true);
			}

			if (data.status === "error") {
				setDone(true);
			}
		});

		socket?.on(username + "-detail", (data: Message) => {
			setDetailMessages((prev) => {
				const msgIndex = prev.findIndex((msg) => msg.id === data.id);
				if (msgIndex !== -1) {
					const updated = [...prev];
					updated[msgIndex] = { ...prev[msgIndex], ...data };
					return [...updated];
				}
				return [...prev, data];
			});
		});

		return function () {
			socket?.off(username);
			socket?.off(username + "-detail");
		};
	}, [nim]);

	async function handleSubmit() {
		let url = process.env.NODE_ENV === "production" ? "/api/presensi" : "http://localhost:4000/api/presensi";
		if (!nim || !password) return;
		setIsLoading(true);
		localStorage.setItem("nim", nim);

		try {
			await axios.post(url, { username: nim, password, penilaian: { dosen: pDosen, asdos: pAsdos } });
		} catch (error) {
			if (!(error instanceof Error)) return;
			console.error(error.message);
			setMessages((p) => [...p, { status: "error", message: error.message }]);
		}
	}

	function clearMessages() {
		setDone(false);
		setMessages([]);
		setDetailMessages([]);
		setIsLoading(false);
	}

	return (
		<main className="bg-[#E7E0C9] text-[#4B3D3E]" style={playfairDisplay.style}>
			<div className="mx-auto flex min-h-screen max-w-md flex-col overflow-auto bg-gradient-to-br from-[#F6ECD6] to-[#E7E0C9] p-6">
				<motion.h1 animate={{ opacity: [0, 1], y: [40, 0] }} transition={{ type: "spring" }} className="relative mt-8 text-3xl font-bold">
					AUTOMATIC
				</motion.h1>
				<motion.h3 animate={{ opacity: [0, 1], x: [-40, 0] }} transition={{ type: "spring", delay: 0.3 }} className="text-3xl font-medium text-[#7BA05B]">
					PRESENSI
				</motion.h3>

				<motion.p animate={{ opacity: [0, 1] }} transition={{ delay: 0.6, duration: 0.5 }} className="mt-1 text-sm">
					Powered by: TypeScript, Express.js, Next.js, Socket.IO, TailwindCSS, Axios, Cheerio, Bun, Docker, Framer Motion, Alpine Linux.
				</motion.p>

				<div className="flex overflow-hidden p-[16px]">
					<div className="relative mt-8 flex w-full flex-col p-4">
						{messages.length > 0 && (
							<>
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-bold text-[#8C6A43]">Log Aktivitas</h3>
									{messages.length > 0 && done && (
										<button onClick={clearMessages} className="text-xs">
											<IconX className="h-5 w-5" />
										</button>
									)}
								</div>
								<div className="mt-4 max-h-[40vh] overflow-y-auto">
									{messages.map((m, i) => {
										let Icon = <IconCheck className="h-5 w-5 text-[#7BA05B]" />;

										if (m.status === "loading") {
											Icon = <IconLoader2 className="h-5 w-5 animate-spin text-[#7AAED6]" />;
										} else if (m.status === "error") {
											Icon = <IconBugFilled className="h-5 w-5 text-[#D87C7C]" />;
										} else if (m.status === "warning") {
											Icon = <IconAlertTriangle className="h-5 w-5 text-[#D8B45C]" />;
										}

										return (
											<motion.div key={i} className="flex flex-row gap-2 border-b border-zinc-700 py-2 last:border-0" animate={{ opacity: [0, 1], y: [10, 0] }} transition={{ delay: i * 0.05 }}>
												<div className="shrink-0">{Icon}</div>
												<p className={`text-sm font-medium ${m.status === "error" ? "text-[#D87C7C]" : m.status === "warning" ? "text-[#D8B45C]" : m.status === "success" ? "text-[#7BA05B]" : ""}`}>{m.message}</p>
											</motion.div>
										);
									})}
								</div>
							</>
						)}

						<AnimatePresence onExitComplete={handleSubmit}>
							{!isLoading && (
								<motion.div layout animate={{ height: isLoading ? 0 : "auto" }} exit={{ height: 0, transition: { delay: 1.6, duration: 1.1, type: "tween" } }} className="flex flex-col gap-4">
									<motion.div layout animate={{ x: [40, 0], opacity: [0, 1] }} exit={{ x: [0, -40], opacity: [1, 0], transition: { delay: 0.6 }, height: 0 }} transition={{ type: "spring", delay: 0.9 }} className="flex flex-col gap-2">
										<motion.label animate={{ x: [40, 0], opacity: [0, 1] }} exit={{ x: [0, -40], opacity: [1, 0], transition: { delay: 0.3 }, height: 0 }} transition={{ type: "spring", delay: 1.1 }} htmlFor="nim" className="text-sm">
											Nomor Induk Mahasiswa
										</motion.label>
										<input id="nim" type="text" placeholder="nim" onChange={(e) => setNim((e.target as HTMLInputElement).value)} value={nim} className="h-10 rounded-sm border border-[#8C6A43] bg-[#F6ECD6] px-3 outline-none transition-colors focus:border-[#7BA05B]" />
									</motion.div>

									<motion.div layout animate={{ x: [40, 0], opacity: [0, 1] }} exit={{ x: [0, -70], opacity: [1, 0], transition: { delay: 1.1 }, height: 0 }} transition={{ type: "spring", delay: 1.3 }} className="flex flex-col gap-2">
										<motion.label animate={{ x: [70, 0], opacity: [0, 1] }} exit={{ x: [0, -70], opacity: [1, 0], transition: { delay: 0.9 }, height: 0 }} transition={{ type: "spring", delay: 1.6 }} htmlFor="password" className="text-sm">
											Password
										</motion.label>
										<input id="password" type="password" onChange={(e) => setPassword((e.target as HTMLInputElement).value)} value={password} placeholder="password" className="h-10 rounded-sm border border-[#8C6A43] bg-[#F6ECD6] px-3 outline-none transition-colors focus:border-[#7BA05B]" />
									</motion.div>

									<motion.div layout animate={{ x: [40, 0], opacity: [0, 1] }} exit={{ x: [0, -70], opacity: [1, 0], transition: { delay: 1.6 }, height: 0 }} transition={{ type: "spring", delay: 1.9 }} className="flex flex-col gap-2">
										<motion.label animate={{ x: [70, 0], opacity: [0, 1] }} exit={{ x: [0, -70], opacity: [1, 0], transition: { delay: 1.3 }, height: 0 }} transition={{ type: "spring", delay: 2.1 }} htmlFor="password" className="text-sm">
											Rating Dosen
										</motion.label>
										<div className="grid grid-cols-4 gap-2">
											{["S Baik", "Baik", "C Baik", "K Baik"].map((v, i) => {
												return (
													<div onClick={() => setPDosen(i)} key={i} className="relative flex cursor-pointer items-center justify-center rounded-sm border border-[#8C6A43] py-2 text-center text-sm">
														{i === pDosen && <motion.div layoutId="ps8us" transition={{ duration: 0.9, type: "spring" }} className="absolute h-full w-full bg-[#7BA05B]" />}
														<motion.p key={pDosen} className={`shdow-lg relative rounded-sm ${i !== pDosen ? "" : "text-white"}`}>
															{v}
														</motion.p>
													</div>
												);
											})}
										</div>{" "}
									</motion.div>

									<motion.div layout animate={{ x: [40, 0], opacity: [0, 1] }} exit={{ x: [0, -70], opacity: [1, 0], transition: { delay: 2.1 }, height: 0 }} transition={{ type: "spring", delay: 2.3 }} className="flex flex-col gap-2">
										<motion.label animate={{ x: [70, 0], opacity: [0, 1] }} exit={{ x: [0, -70], opacity: [1, 0], transition: { delay: 1.9 }, height: 0 }} transition={{ type: "spring", delay: 2.6 }} htmlFor="password" className="text-sm">
											Rating Asdos
										</motion.label>
										<div className="grid grid-cols-4 gap-2">
											{["S Baik", "Baik", "Cukup", "Kurang"].map((v, i) => {
												return (
													<div onClick={() => setPAsdos(i)} key={i} className="relative flex cursor-pointer items-center justify-center rounded-sm border border-[#8C6A43] py-2 text-center text-sm">
														{i === pAsdos && <motion.div layoutId="ps8u" transition={{ duration: 0.9, type: "spring" }} className="absolute h-full w-full bg-[#7BA05B]" />}
														<motion.p key={pAsdos} className={`shdow-lg relative rounded-sm ${i !== pAsdos ? "" : "text-white"}`}>
															{v}
														</motion.p>
													</div>
												);
											})}
										</div>
									</motion.div>

									<div className="flex flex-row">
										<motion.div animate={{ width: ["0%", "100%"] }} transition={{ delay: 2.1, type: "spring", duration: 3.9 }} />
										<motion.div className="shrink-0" animate={{ y: [70, 0], opacity: [0, 1] }} exit={{ y: [0, -70], opacity: [1, 0], transition: { delay: 1.3 }, height: 0 }} transition={{ type: "spring", delay: 1.9 }}>
											<button onClick={() => setIsLoading(true)} disabled={!nim || !password} className="rounded-sm bg-[#8C6A43] px-4 py-2 text-sm text-[#F6ECD6] shadow-lg transition-colors disabled:bg-[#8C6A43]/50 disabled:opacity-50">
												Mulai Presensi
											</button>
										</motion.div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						<motion.div animate={{ y: [70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.4 : 1.3, duration: 0.7 }} layout layoutId="pp1" className="absolute right-0 top-1/2 z-10 h-full w-[1.3px]">
							<motion.div className="-translate-y-1/2 bg-[#7BA05B]" initial={{ height: "0px" }} animate={{ height: "calc(100% + 32px)" }} />
						</motion.div>

						<motion.div animate={{ y: [-70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.3 : 1.6, duration: 0.7 }} layout layoutId="pp2" className="absolute left-0 top-1/2 z-10 h-full w-[1.3px]">
							<motion.div className="-translate-y-1/2 bg-[#7BA05B]" initial={{ height: "0px" }} animate={{ height: "calc(100% + 32px)" }} />
						</motion.div>

						<motion.div animate={{ x: [-70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.2 : 1.9, duration: 0.7 }} layout layoutId="pp3" className="absolute left-1/2 top-0 z-10 h-[1.3px] w-full">
							<motion.div className="h-[1.3px] -translate-x-1/2 bg-[#7BA05B]" initial={{ width: "0px" }} animate={{ width: "calc(100% + 32px)" }} />
						</motion.div>

						<motion.div animate={{ x: [70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.1 : 2.1, duration: 0.7 }} layout layoutId="pp4" className="absolute bottom-0 left-1/2 z-10 h-[1.3px] w-full">
							<motion.div className="h-[1.3px] -translate-x-1/2 bg-[#7BA05B]" initial={{ width: "0px" }} animate={{ width: "calc(100% + 32px)" }} />
						</motion.div>
					</div>
				</div>

				{detailMessages.length > 0 && (
					<div className="flex flex-1 overflow-hidden p-[16px]">
						<div className="pointer-events-auto relative mt-8 flex w-full flex-col overflow-visible p-4">
							<>
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-bold text-[#8C6A43]">Detail Message</h3>
								</div>
								<div className="mt-4 max-h-[40vh] overflow-y-auto">
									{detailMessages.map((m, i) => {
										let Icon = <IconCheck className="h-5 w-5 text-[#7BA05B]" />;

										if (m.status === "loading") {
											Icon = <IconLoader2 className="h-5 w-5 animate-spin text-[#7AAED6]" />;
										} else if (m.status === "error") {
											Icon = <IconBugFilled className="h-5 w-5 text-[#D87C7C]" />;
										} else if (m.status === "warning") {
											Icon = <IconAlertTriangle className="h-5 w-5 text-[#D8B45C]" />;
										}

										return (
											<motion.div key={i} className="flex flex-row gap-2 border-b border-zinc-700 py-2 last:border-0" animate={{ opacity: [0, 1], y: [10, 0] }} transition={{ delay: i * 0.05 }}>
												<div className="shrink-0">{Icon}</div>
												<p className={`text-sm font-medium ${m.status === "error" ? "text-[#D87C7C]" : m.status === "warning" ? "text-[#D8B45C]" : m.status === "success" ? "text-[#7BA05B]" : ""}`}>{m.message}</p>
											</motion.div>
										);
									})}
								</div>
							</>

							<motion.div animate={{ y: [70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.4 : 1.3, duration: 0.7 }} layout layoutId="pp5" className="absolute right-0 top-1/2 z-10 h-full w-[1.3px]">
								<motion.div className="-translate-y-1/2 bg-[#8C6A43]" initial={{ height: "0px" }} animate={{ height: "calc(100% + 32px)" }} />
							</motion.div>

							<motion.div animate={{ y: [-70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.3 : 1.6, duration: 0.7 }} layout layoutId="pp6" className="absolute left-0 top-1/2 z-10 h-full w-[1.3px]">
								<motion.div className="-translate-y-1/2 bg-[#8C6A43]" initial={{ height: "0px" }} animate={{ height: "calc(100% + 32px)" }} />
							</motion.div>

							<motion.div animate={{ x: [-70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.2 : 1.9, duration: 0.7 }} layout layoutId="pp7" className="absolute left-1/2 top-0 z-10 h-[1.3px] w-full">
								<motion.div className="h-[1.3px] -translate-x-1/2 bg-[#8C6A43]" initial={{ width: "0px" }} animate={{ width: "calc(100% + 32px)" }} />
							</motion.div>

							<motion.div animate={{ x: [70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.1 : 2.1, duration: 0.7 }} layout layoutId="pp8" className="absolute bottom-0 left-1/2 z-10 h-[1.3px] w-full">
								<motion.div className="h-[1.3px] -translate-x-1/2 bg-[#8C6A43]" initial={{ width: "0px" }} animate={{ width: "calc(100% + 32px)" }} />
							</motion.div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
