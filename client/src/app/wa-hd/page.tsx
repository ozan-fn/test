"use client";

import React, { useEffect, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function Page() {
	const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
	const [progress, setProgress] = useState(0);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [outputURL, setOutputURL] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	async function loadFFmpeg() {
		if (!ffmpeg) {
			const ffmpegInstance = new FFmpeg();
			ffmpegInstance.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
			await ffmpegInstance.load();
			setFfmpeg(ffmpegInstance);
			console.log("FFmpeg loaded!");
		}
	}

	async function processVideo() {
		if (ffmpeg && selectedFile) {
			setIsProcessing(true);
			setProgress(0);
			console.log("Processing...");

			await ffmpeg.writeFile("input.mp4", await fetchFile(selectedFile));
			await ffmpeg.exec(["-i", "input.mp4", "-preset", "fast", "-crf", "28", "output.mp4"]);

			const data = await ffmpeg.readFile("output.mp4");
			const convertedURL = URL.createObjectURL(new Blob([data], { type: "video/mp4" }));
			setOutputURL(convertedURL);
			setIsProcessing(false);
			console.log("Output video URL:", convertedURL);
		}
	}

	useEffect(() => {
		loadFFmpeg();
	}, []);

	return (
		<div className="bg-[#E7E0C9] text-[#4B3D3E]">
			<div className="max-w-7xl w-full mx-auto min-h-screen py-12 px-8">
				<h1 className="text-4xl font-bold">Wa-HD</h1>
			</div>
		</div>
	);
}
