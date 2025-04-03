"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { IconFilePlus, IconX, IconAlertCircle } from "@tabler/icons-react";

const API = process.env.NODE_ENV === "production" ? "" : "http://localhost:4000";

const MAX_IMAGE_SIZE = 0.5 * 1024 * 1024; // 1MB in bytes
const MAX_VIDEO_SIZE = 6 * 1024 * 1024; // 6MB in bytes

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

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return bytes + " bytes";
	else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
	else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function Page() {
	const input = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedFileURL, setSelectedFileURL] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [nowa, setNowa] = useState("");
	const [caption, setCaption] = useState("");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [fileSizeWarning, setFileSizeWarning] = useState(false);

	useEffect(() => {
		if (selectedFile) {
			const isImage = selectedFile.type.includes("image");
			const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
			setFileSizeWarning(selectedFile.size > maxSize);
		} else {
			setFileSizeWarning(false);
		}
	}, [selectedFile]);

	async function reset() {
		setSelectedFile(null);
		setSelectedFileURL(null);
		setFileSizeWarning(false);
	}

	async function uploadToServer() {
		if (!selectedFile) return;
		setIsProcessing(true);

		try {
			const formData = new FormData();
			formData.append("file", selectedFile, selectedFile.name);
			formData.append("nowa", parsePhoneNumber(nowa));
			formData.append("caption", caption);

			const uploadResponse = await axios.post(API + "/api/wa-hd", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					const loaded = progressEvent.loaded;
					const total = progressEvent.total || 0;
					const progress = Math.round((loaded / total) * 100);
					setUploadProgress(progress);
				},
			});

			console.log("Upload response:", uploadResponse);
			alert("File berhasil dikirim ke server!");
			setShowModal(false);
			reset();
		} catch (error) {
			console.error("Upload error:", error);
			alert("Gagal mengirim file ke server.");
		} finally {
			setIsProcessing(false);
			setUploadProgress(0);
		}
	}

	return (
		<div className="bg-[#E6DFD9] text-black/80 font-poppins">
			<div className="max-w-md w-full shadow-sm shadow-black/80 mx-auto min-h-screen py-8 px-4">
				{/* Title */}
				<div className="flex flex-col gap-1">
					<h3 className="text-2xl font-bold">WhatsApp HD Sender</h3>
					<h6 className="font-medium">Kirim foto & video HD ke WhatsApp</h6>
				</div>

				{selectedFile && selectedFileURL ? (
					<>
						<div className="relative border border-dashed border-black/80 rounded-md flex justify-center items-center mt-6">
							{selectedFile.type.includes("image") ? <img className="w-full" src={selectedFileURL} /> : <video className="w-full" src={selectedFileURL} controls />}

							<div onClick={reset} className="absolute cursor-pointer -top-2 -right-2 h-8 w-8 bg-black/80 border rounded-full flex justify-center items-center">
								<IconX className="text-white/80" />
							</div>
						</div>

						<div className="mt-2 flex flex-row justify-between items-center">
							<p className="text-sm">Ukuran file: {formatFileSize(selectedFile.size)}</p>
							<p className="text-sm">{selectedFile.type.includes("image") ? "Foto" : "Video"}</p>
						</div>

						{fileSizeWarning && (
							<div className="mt-2 p-3 bg-amber-100 border border-amber-300 rounded-md flex items-start gap-2">
								<IconAlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
								<div>
									<p className="font-medium">Ukuran file terlalu besar</p>
									<p className="text-sm">
										Untuk {selectedFile.type.includes("image") ? "foto sebaiknya tidak melebihi 500KB" : "video sebaiknya tidak melebihi 6MB"}. Silakan kompres file Anda di{" "}
										<a href="https://www.freeconvert.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
											freeconvert.com
										</a>{" "}
										terlebih dahulu.
									</p>
								</div>
							</div>
						)}

						<div className="mt-4 flex flex-row gap-2">
							<button onClick={() => setShowModal(true)} disabled={isProcessing} className="px-3 w-fit py-2 rounded-md bg-black/80 text-white/80 cursor-pointer shadow-sm shadow-black/80 disabled:bg-black/70 disabled:cursor-not-allowed">
								Kirim ke WhatsApp
							</button>
						</div>
					</>
				) : (
					<>
						<input
							ref={input}
							onChange={(e) => {
								if (e.target.files && e.target.files.length > 0) {
									setSelectedFile(e.target.files[0]);
									setSelectedFileURL(URL.createObjectURL(e.target.files[0]));
								}
							}}
							type="file"
							accept="image/*,video/*"
							className="hidden"
						/>
						<label onClick={() => input.current?.click()} className="aspect-video cursor-pointer overflow-hidden border border-dashed border-black/80 rounded-md flex justify-center items-center mt-6">
							<IconFilePlus className="w-10 h-10 stroke-[1.5]" />
						</label>

						<div className="mt-4">
							<p className="text-sm">Ukuran file yang disarankan:</p>
							<ul className="list-disc list-inside text-sm mt-1">
								<li>Foto: maksimal 500KB</li>
								<li>Video: maksimal 3-6MB</li>
							</ul>
						</div>
					</>
				)}
			</div>

			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
						<h3 className="text-xl font-bold mb-4">Kirim ke WhatsApp</h3>

						{fileSizeWarning && (
							<div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-md flex items-start gap-2">
								<IconAlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
								<div>
									<p className="font-medium">Peringatan: Ukuran file besar</p>
									<p className="text-sm">
										File ini mungkin terlalu besar untuk dikirim. Pertimbangkan untuk mengompres terlebih dahulu di{" "}
										<a href="https://www.freeconvert.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
											freeconvert.com
										</a>
									</p>
								</div>
							</div>
						)}

						<div className="flex flex-col gap-2 mb-6">
							<label htmlFor="p">No WhatsApp</label>
							<input type="text" id="p" onChange={(e) => setNowa(e.target.value)} value={nowa} className="py-2 px-3 border rounded-md border-black/80" />
						</div>

						{isProcessing && uploadProgress > 0 && (
							<>
								<div className="w-full border mb-4 rounded-md border-black/80">
									<motion.div initial={{ width: "0%" }} animate={{ width: uploadProgress + "%" }} transition={{ type: "spring", duration: 2 }} className="h-2 bg-black/80 rounded-md"></motion.div>
								</div>
								<p className="mb-4 text-sm">{uploadProgress}%</p>
							</>
						)}

						<div className="flex justify-end gap-2">
							<button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer">
								Batal
							</button>
							<button onClick={uploadToServer} disabled={isProcessing} className="px-4 py-2 bg-black/80 cursor-pointer text-white rounded-md disabled:bg-black/70 disabled:cursor-not-allowed">
								Kirim
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
