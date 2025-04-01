"use client";

import { Marcellus } from "next/font/google";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

const marcellus = Marcellus({ weight: "400", subsets: ["latin"] });

export default function Layout() {
	// State for window width to handle responsiveness
	const [windowWidth, setWindowWidth] = useState(0);

	// Animation for floating elements (Ghibli-style)
	const floatingAnimation = {
		initial: { y: 0 },
		animate: {
			y: [0, -10, 0],
			transition: {
				duration: 4,
				repeat: Infinity,
				ease: "easeInOut",
			},
		},
	};

	// Fade-in animation for content
	const fadeIn = {
		initial: { opacity: 0, y: 20 },
		animate: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8 },
		},
	};

	// Handle resize events
	useEffect(() => {
		if (typeof window !== "undefined") {
			setWindowWidth(window.innerWidth);

			const handleResize = () => {
				setWindowWidth(window.innerWidth);
			};

			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}
	}, []);

	return (
		<main className={`min-h-screen flex flex-col bg-[#F3EACB] text-[#3B3A36] ${marcellus.className}`}>
			<div className="max-w-7xl mx-auto w-full grow flex flex-col md:flex-row items-center px-6 py-12 md:py-16 relative overflow-hidden">
				{/* Decorative Ghibli-style clouds */}
				<motion.div className="absolute top-16 left-12 w-32 h-16 bg-white rounded-full opacity-70" {...floatingAnimation} />
				<motion.div className="absolute top-24 right-24 w-40 h-20 bg-white rounded-full opacity-70" variants={floatingAnimation} initial="initial" animate="animate" custom={1.5} />

				{/* Main content */}
				<div className="md:w-1/2 z-10">
					<motion.div variants={fadeIn} initial="initial" animate="animate">
						<h1 className="text-4xl md:text-5xl font-extrabold">Hi, I'm Ozan</h1>
						<h4 className="text-xl mt-1 font-semibold text-[#6A8D73]">Fullstack Enthusiast</h4>

						<motion.p className="mt-6 text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
							I build beautiful, responsive web applications with a touch of magic.
						</motion.p>

						<motion.div className="mt-8" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
							<a href="#projects" className="bg-[#6A8D73] text-white px-6 py-3 rounded-md hover:bg-[#5c7a62] transition-colors duration-300">
								View My Work
							</a>
						</motion.div>
					</motion.div>
				</div>

				{/* Photo with Ghibli-style frame */}
				<motion.div className="mt-12 md:mt-0 md:w-1/2 flex justify-center items-center z-10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
					<div className="relative">
						{/* Placeholder for your photo - replace with your actual image */}
						<div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#6A8D73] relative">
							{/* Replace with your actual image */}
							<div className="w-full h-full bg-[#DED6C0] flex items-center justify-center text-lg">Your Photo Here</div>
						</div>

						{/* Ghibli-style decorative elements */}
						<motion.div className="absolute -bottom-4 -right-4 w-20 h-20" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
							<div className="w-full h-full rounded-full border-2 border-[#6A8D73] border-dashed"></div>
						</motion.div>

						<motion.div className="absolute -top-6 -left-6 text-4xl" {...floatingAnimation}>
							✨
						</motion.div>
					</div>
				</motion.div>
			</div>

			{/* Projects section (placeholder) */}
			<div id="projects" className="bg-[#E8DFBB] py-16 px-6">
				<div className="max-w-7xl mx-auto">
					<motion.h2 className="text-3xl font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
						My Projects
					</motion.h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[1, 2, 3].map((item) => (
							<motion.div key={item} className="bg-[#F3EACB] rounded-lg overflow-hidden shadow-md" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: item * 0.1 }} viewport={{ once: true }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
								<div className="h-48 bg-[#6A8D73] opacity-80"></div>
								<div className="p-6">
									<h3 className="text-xl font-semibold">Project {item}</h3>
									<p className="mt-2 text-[#3B3A36]/80">A short description of this amazing project with Ghibli-inspired design.</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
