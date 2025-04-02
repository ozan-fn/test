"use client";

import React, { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import axios from "axios";
import { motion } from "framer-motion";
import { IconFilePlus, IconX } from "@tabler/icons-react";

const API = process.env.NODE_ENV === "production" ? "" : "http://localhost:4000";

async function toBlobURL(url: string, cb?: (progress: number) => void) {
	const response = await axios.get(url, {
		responseType: "blob",
		onDownloadProgress: (progressEvent) => {
			const loaded = progressEvent.loaded;
			const progress = Math.round((loaded / 32718323) * 100);
			cb && cb(progress);
		},
	});
	const blobURL = URL.createObjectURL(response.data);
	return blobURL;
}

function parsePhoneNumber(phoneNumber: string) {
	let cleanedNumber = phoneNumber.replace(/\D/g, "");

	if (cleanedNumber.startsWith("0")) {
		cleanedNumber = "62" + cleanedNumber.slice(1);
	}

	if (!/^(\d{8,})$/.test(cleanedNumber)) {
		throw new Error("Invalid phone number format");
	}

	return `${cleanedNumber}`;
}

export default function Page() {
	const input = useRef<HTMLInputElement>(null);
	const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
	const [progress, setProgress] = useState(0);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedFileURL, setSelectedFileURL] = useState<string | null>(null);
	const [outputURL, setOutputURL] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [teruskan, setTeruskan] = useState("");
	const [selectedQuality, setSelectedQuality] = useState("720");
	const [nowa, setNowa] = useState("");
	const [caption, setCaption] = useState("");

	async function loadFFmpeg() {
		if (ffmpeg) return;
		const ffmpegInstance = new FFmpeg();
		ffmpegInstance.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
		await ffmpegInstance.load({
			coreURL: await toBlobURL(`/ffmpeg-core.js`),
			wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, (cb) => setProgress(cb)),
			workerURL: await toBlobURL(`/ffmpeg-core.worker.js`),
		});
		setFfmpeg(ffmpegInstance);
		setProgress(0);
	}

	async function process() {
		if (!ffmpeg || !selectedFile) return;

		setIsProcessing(true);

		try {
			console.log("Processing...");

			const inputFilename = selectedFile.type.includes("image") ? "input.jpg" : "input.mp4";
			const outputFilename = selectedFile.type.includes("image") ? "output.jpg" : "output.mp4";
			const outputType = selectedFile.type.includes("image") ? "image/jpeg" : "video/mp4";

			await ffmpeg.writeFile(inputFilename, await fetchFile(selectedFile));

			if (selectedFile.type.includes("image")) {
				await ffmpeg.exec(["-i", inputFilename, "-vf", `scale=${selectedQuality}:-1`, outputFilename]);
			} else {
				await ffmpeg.exec(["-i", inputFilename, "-preset", "fast", "-crf", "28", "-vf", `scale=${selectedQuality}:-1`, "-c:a", "aac", "-b:a", "128k", outputFilename]);
			}

			const data = await ffmpeg.readFile(outputFilename);
			const convertedURL = URL.createObjectURL(new Blob([data], { type: outputType }));
			setOutputURL(convertedURL);
		} catch (error) {
			console.error(error);
		} finally {
			setIsProcessing(false);
		}
	}

	async function reset() {
		setSelectedFile(null);
		setOutputURL(null);
	}

	async function uploadToServer() {
		if (!teruskan) return;
		setIsProcessing(true);

		try {
			const response = await fetch(teruskan);
			const blob = await response.blob();
			const formData = new FormData();
			formData.append("file", blob, selectedFile?.name || "converted-file");
			formData.append("nowa", parsePhoneNumber(nowa));
			formData.append("caption", caption);

			const uploadResponse = await axios.post(API + "/api/wa-hd", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			console.log("Upload response:", uploadResponse);
			alert("File berhasil dikirim ke server!");
		} catch (error) {
			console.error("Upload error:", error);
			alert("Gagal mengirim file ke server.");
		} finally {
			setIsProcessing(false);
		}
	}

	useEffect(() => {
		return () => {
			if (outputURL) {
				URL.revokeObjectURL(outputURL);
			}
		};
	}, []);

	return (
		<div className="bg-[#E6DFD9] text-black/80 font-poppins">
			<div className="max-w-md w-full shadow-sm shadow-black/80 mx-auto min-h-screen py-8 px-4">
				{/* Title */}
				<div className="flex flex-col gap-1">
					<h3 className="text-2xl font-bold">WhatsApp HD Converter</h3>
					<h6 className="font-medium">Ubah foto & video agar tetap HD saat dikirim ke WhatsApp</h6>
				</div>

				{!ffmpeg && progress !== 100 ? (
					<>
						{/* Body */}
						<div className="flex gap-1 flex-col mt-6">
							<button onClick={loadFFmpeg} className="px-3 w-fit py-2 rounded-md bg-black/80 text-white/80 cursor-pointer shadow-sm shadow-black/80">
								Load Encoders
							</button>
							<p>Ini akan mendownload ~10MB (pertama kali)</p>
						</div>

						{progress !== 0 && (
							<>
								<div className="w-full border mt-6 rounded-md border-black/80">
									<motion.div initial={{ width: "0%" }} animate={{ width: progress + "%" }} transition={{ type: "spring", duration: 2 }} className="h-2 bg-black/80 rounded-md"></motion.div>
								</div>
								<p className="mt-1 text-sm">{progress}%</p>
							</>
						)}
					</>
				) : (
					<>
						{selectedFile && selectedFileURL ? (
							<>
								<div className="relative border border-dashed border-black/80 rounded-md flex justify-center items-center mt-6">
									{selectedFile.type.includes("image") ? <img className="w-full" src={selectedFileURL} /> : <video className="w-full" src={selectedFileURL} controls />}

									<div onClick={reset} className="absolute cursor-pointer -top-2 -right-2 h-8 w-8 bg-black/80 border rounded-full flex justify-center items-center">
										<IconX className="text-white/80" />
									</div>
								</div>

								<div className="mt-4">
									<label className="block mb-2 text-sm font-medium">Pilih Kualitas:</label>
									<select value={selectedQuality} onChange={(e) => setSelectedQuality(e.target.value)} className="bg-white border border-black/80 text-black/80 rounded-md block w-full p-2 mb-4">
										<option value="480">480p</option>
										<option value="720">720p</option>
										<option value="1080">1080p</option>
										<option value="1440">1440p (2K)</option>
										<option value="2160">2160p (4K)</option>
									</select>
								</div>

								<div className="mt-4 flex flex-row gap-2">
									<button onClick={process} disabled={isProcessing} className="px-3 w-fit py-2 rounded-md bg-black/80 text-white/80 cursor-pointer shadow-sm shadow-black/80 disabled:bg-black/70 disabled:cursor-not-allowed">
										Encode {selectedQuality} pixel
									</button>

									<button onClick={() => setTeruskan(selectedFileURL)} disabled={isProcessing} className="px-3 w-fit py-2 rounded-md border border-black/80 text-black/80 cursor-pointer shadow-sm shadow-black/80 disabled:border-black/70 disabled:cursor-not-allowed">
										Lewati
									</button>
								</div>

								<div className="w-full border mt-4 rounded-md border-black/80">
									<motion.div initial={{ width: "0%" }} animate={{ width: progress + "%" }} transition={{ type: "spring", duration: 2 }} className="h-2 bg-black/80 rounded-md"></motion.div>
								</div>
								<p className="mt-1 text-sm">{progress}%</p>
							</>
						) : (
							<>
								<input
									ref={input}
									onChange={(e) => {
										setSelectedFile(e.target.files?.[0] || null);
										setSelectedFileURL(URL.createObjectURL(e.target.files![0]));
									}}
									type="file"
									accept="image/*,video/*"
									className="hidden"
								/>
								<label onClick={() => input.current?.click()} className="aspect-video cursor-pointer overflow-hidden border border-dashed border-black/80 rounded-md flex justify-center items-center mt-6">
									<IconFilePlus className="w-10 h-10 stroke-[1.5]" />
								</label>
							</>
						)}

						{outputURL && selectedFile && (
							<>
								<p className="text-lg font-medium mt-4">Hasil: </p>

								{selectedFile.type.includes("image") ? (
									<>
										<img className="w-full" src={outputURL} />
									</>
								) : (
									<video className="w-full" src={outputURL} controls />
								)}

								<button
									onClick={() => {
										setTeruskan(selectedFileURL!);
									}}
									disabled={isProcessing}
									className="px-3 mt-4 w-fit py-2 rounded-md bg-black/80 text-white/80 cursor-pointer shadow-sm shadow-black/80 disabled:bg-black/70 disabled:cursor-not-allowed"
								>
									Teruskan
								</button>
							</>
						)}
					</>
				)}
			</div>

			{teruskan && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
						<h3 className="text-xl font-bold mb-4">Kirim ke Server</h3>
						<div className="flex flex-col gap-2 mb-6">
							<label htmlFor="p">No Whatsapp</label>
							<input type="text" id="p" onChange={(e) => setNowa(e.target.value)} value={nowa} className="py-2 px-3 border rounded-md border-black/80" />

							<label htmlFor="c">Caption</label>
							<textarea id="c" rows={2} onChange={(e) => setCaption(e.target.value)} value={caption} className="px-3 py-2 border rounded-md border-black/80" />
						</div>
						<div className="flex justify-end gap-2">
							<button onClick={() => setTeruskan("")} className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer">
								Batal
							</button>
							<button onClick={() => uploadToServer()} disabled={isProcessing} className="px-4 py-2 bg-black/80 cursor-pointer text-white rounded-md disabled:bg-black/70 disabled:cursor-not-allowed">
								Kirim
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
