import { AnimatePresence, motion } from 'framer-motion'
import { IconAlertTriangle, IconBugFilled, IconCheck, IconLoader2, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import axios from 'axios'
import { Message } from '../../src/types'

const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000'

const App = () => {
	//
	const [socket, setSocket] = useState<Socket | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [messages, setMessages] = useState<Message[]>([])
	const [nim, setNim] = useState('')
	const [password, setPassword] = useState('')
	const [done, setDone] = useState(false)

	useEffect(() => {
		setSocket(io(URL))

		return function () {
			socket?.disconnect()
		}
	}, [])

	useEffect(() => {
		if (!socket && !nim) return
		let username = nim.toUpperCase()

		socket?.on(username, (data: Message) => {
			setMessages((prev) => {
				const msgIndex = prev.findIndex((msg) => msg.id === data.id)
				if (msgIndex >= 0) {
					const updated = [...prev]
					updated[msgIndex] = { ...prev[msgIndex], ...data }
					return updated
				}
				return [...prev, data]
			})

			if (data.status === 'success' && (data.message.includes('Selesai memproses') || data.message.includes('Tidak ada mata kuliah') || data.message.includes('validasi mata kuliah'))) {
				setDone(true)
			}

			if (data.status === 'error') {
				setDone(true)
			}
		})

		return function () {
			socket?.off(username)
		}
	}, [nim])

	async function handleSubmit() {
		let url = process.env.NODE_ENV === 'production' ? '/api/presensi' : 'http://localhost:4000/api/presensi'
		if (!nim || !password) return
		setIsLoading(true)

		try {
			await axios.post(url, { username: nim, password })
		} catch (error) {
			if (!(error instanceof Error)) return
			console.error(error.message)
			setMessages((p) => [...p, { status: 'error', message: error.message }])
		}
	}

	function clearMessages() {
		setDone(false)
		setMessages([])
		setIsLoading(false)
	}

	return (
		<div className="mx-auto flex h-screen min-h-screen w-full max-w-md flex-col bg-gradient-to-br from-zinc-900 to-zinc-700 to-70% p-6 font-poppins text-zinc-100">
			<motion.h1 animate={{ opacity: [0, 1], y: [40, 0] }} transition={{ type: 'spring' }} className="relative mt-8 text-3xl font-bold">
				AUTOMATIC
				<IconLoader2 className="absolute right-0 top-0 animate-spin" />
			</motion.h1>
			<motion.h3 animate={{ opacity: [0, 1], x: [-40, 0] }} transition={{ type: 'spring', delay: 0.3 }} className="text-3xl font-medium text-purple-400">
				PRESENSI
			</motion.h3>

			<motion.p animate={{ opacity: [0, 1] }} transition={{ delay: 0.6, duration: 0.5 }} className="mt-1 text-sm">
				Powered by: TypeScript, Express.js, React.js, Socket.IO, TailwindCSS, Axios, Cheerio, Bun, Docker, Rsbuild. Framer Motion
			</motion.p>

			<div className="flex flex-1 p-[16px]">
				<AnimatePresence>
					<motion.div layout layoutId="par" className="relative mt-8 flex h-fit max-w-lg flex-1 flex-col p-4 shadow-lg">
						{messages.length > 0 && (
							<>
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-bold text-purple-400">Log Aktivitas</h3>
									{messages.length > 0 && done && (
										<button onClick={clearMessages} className="text-xs">
											<IconX className="h-5 w-5" />
										</button>
									)}
								</div>
								<div className="mt-4 max-h-[36vh] overflow-y-auto">
									{messages.map((m, i) => {
										let Icon = <IconCheck className="h-5 w-5 text-green-500" />

										if (m.status === 'loading') {
											Icon = <IconLoader2 className="h-5 w-5 animate-spin text-blue-400" />
										} else if (m.status === 'error') {
											Icon = <IconBugFilled className="h-5 w-5 text-red-500" />
										} else if (m.status === 'warning') {
											Icon = <IconAlertTriangle className="h-5 w-5 text-yellow-500" />
										}

										return (
											<motion.div key={i} className="flex flex-row gap-2 border-b border-zinc-700 py-2 last:border-0" animate={{ opacity: [0, 1], y: [10, 0] }} transition={{ delay: i * 0.05 }}>
												<div className="shrink-0">{Icon}</div>
												<p className={`text-sm font-medium ${m.status === 'error' ? 'text-red-400' : m.status === 'warning' ? 'text-yellow-400' : m.status === 'success' ? 'text-green-400' : ''}`}>{m.message}</p>
											</motion.div>
										)
									})}
								</div>
							</>
						)}

						<AnimatePresence onExitComplete={handleSubmit}>
							{!isLoading && (
								<motion.div key="form" layout className="flex flex-col gap-4">
									<motion.div layout animate={{ y: [70, 0], opacity: [0, 1] }} exit={{ y: [0, -70], opacity: [1, 0], transition: { delay: 0.3 } }} transition={{ type: 'spring', delay: 0.9 }} className="flex flex-col gap-2">
										<motion.label animate={{ x: [70, 0], opacity: [0, 1] }} exit={{ x: [0, -70], opacity: [1, 0], transition: { delay: 0.6 } }} transition={{ type: 'spring', delay: 1.2 }} htmlFor="nim" className="text-sm">
											Nomor Induk Mahasiswa
										</motion.label>
										<input id="nim" type="text" placeholder="nim" onChange={(e) => setNim(e.target.value)} value={nim} className="h-10 rounded-sm border border-zinc-700 bg-zinc-900 px-3 outline-none transition-colors focus:border-purple-500" />
									</motion.div>

									<motion.div layout animate={{ y: [70, 0], opacity: [0, 1] }} exit={{ y: [0, -70], opacity: [1, 0], transition: { delay: 0.9 } }} transition={{ type: 'spring', delay: 1.6 }} className="flex flex-col gap-2">
										<motion.label animate={{ x: [70, 0], opacity: [0, 1] }} exit={{ x: [0, -70], opacity: [1, 0], transition: { delay: 1.1 } }} transition={{ type: 'spring', delay: 1.3 }} htmlFor="password" className="text-sm">
											Password
										</motion.label>
										<input id="password" type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="password" className="h-10 rounded-sm border border-zinc-700 bg-zinc-900 px-3 outline-none transition-colors focus:border-purple-500" />
									</motion.div>

									<motion.div layout className="flex w-full justify-end" animate={{ y: [70, 0], opacity: [0, 1] }} exit={{ y: [0, -70], opacity: [1, 0], transition: { delay: 1.3 } }} transition={{ type: 'spring', delay: 1.9 }}>
										<button onClick={() => setIsLoading(true)} disabled={!nim || !password} className="rounded-sm bg-purple-500 px-4 py-2 text-sm text-zinc-100 shadow-lg transition-colors hover:bg-purple-600 disabled:bg-zinc-600 disabled:opacity-50">
											Mulai Presensi
										</button>
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>

						<motion.div animate={{ y: [70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.4 : 1.3, duration: 0.7 }} layout layoutId="pp1" className="absolute right-0 top-1/2 h-full w-[1.3px]">
							<motion.div className="-translate-y-1/2 bg-purple-400" initial={{ height: '0px' }} animate={{ height: 'calc(100% + 32px)' }} />
						</motion.div>

						<motion.div animate={{ y: [-70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.3 : 1.6, duration: 0.7 }} layout layoutId="pp2" className="absolute left-0 top-1/2 h-full w-[1.3px]">
							<motion.div className="-translate-y-1/2 bg-purple-400" initial={{ height: '0px' }} animate={{ height: 'calc(100% + 32px)' }} />
						</motion.div>

						<motion.div animate={{ x: [-70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.2 : 1.9, duration: 0.7 }} layout layoutId="pp3" className="absolute left-1/2 top-0 h-[1.3px] w-full">
							<motion.div className="h-[1.3px] -translate-x-1/2 bg-purple-400" initial={{ width: '0px' }} animate={{ width: 'calc(100% + 32px)' }} />
						</motion.div>

						<motion.div animate={{ x: [70, 0], opacity: [0, 1] }} transition={{ delay: isLoading ? 0.1 : 2.1, duration: 0.7 }} layout layoutId="pp4" className="absolute bottom-0 left-1/2 h-[1.3px] w-full">
							<motion.div className="h-[1.3px] -translate-x-1/2 bg-purple-400" initial={{ width: '0px' }} animate={{ width: 'calc(100% + 32px)' }} />
						</motion.div>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	)
}

export default App
