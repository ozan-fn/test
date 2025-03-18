"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pusher from "pusher-js";
import { Progress } from "./components/ui/progress";
import { motion } from "motion/react";
import { CheckIcon } from "lucide-react";

interface Message {
    id?: string;
    message: string;
    status: "info" | "loading" | "progress" | "success" | "error" | "warning" | "done";
}

const pusher = new Pusher("af98277e22dd8b41a76e", {
    cluster: "ap1",
});

export default function App() {
    const [nim, setNim] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const [courses, setCourses] = useState<{ id: string; makul: string; count: number }[]>([]);
    const [completedCourses, setCompletedCourses] = useState<string[]>([]);

    const channelRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (channelRef.current) {
                channelRef.current.unbind_all();
                channelRef.current.unsubscribe();
            }
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!nim || !password) return;

        setLoading(true);
        setMessages([]);
        setProgress(null);
        setCourses([]);
        setCompletedCourses([]);

        pusher.unbind_all();

        const channelName = `${nim.toUpperCase()}`;
        pusher.subscribe(channelName);

        pusher.bind("presensi-status", (data: any) => {
            //
            if (data.id) {
                setMessages(prevMessages => {
                    const index = prevMessages.findIndex(msg => msg.id == data.id);

                    if (index !== -1) {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[index] = { ...prevMessages[index], message: data.message, status: data.status };
                        return updatedMessages;
                    }

                    return [...prevMessages, { id: data.id, message: data.message, status: data.status }];
                });
            } else {
                setMessages(prevMessages => [...prevMessages, { message: data.message, status: data.status }]);
            }

            if (data.progress) {
                setProgress(data.progress);
            }

            if (data.courses) {
                setCourses(data.courses);
            }

            if (data.completedCourse) {
                setCompletedCourses(prev => [...prev, data.completedCourse.makul]);
            }

            if (data.status === "done" || data.status === "error") {
                setLoading(false);
            }
        });

        try {
            const response = await fetch("/api/presensi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: nim, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                setMessages(prev => [
                    ...prev,
                    {
                        message: result.message || "Terjadi kesalahan pada server",
                        status: "error",
                    },
                ]);
                setLoading(false);
            }
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    message: "Tidak dapat terhubung ke server",
                    status: "error",
                },
            ]);
            setLoading(false);
        }
    };

    return (
        <main className="bg-background text-foreground min-h-screen flex flex-col p-8">
            <div className="max-w-7xl mx-auto flex-grow w-full">
                <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">Automatic Presensi Amikom University</h2>

                <form className="max-w-md flex flex-col gap-4 mt-6 w-full" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="nim">Nomor Induk Mahasiswa</Label>
                        <Input id="nim" value={nim} onChange={e => setNim(e.target.value)} disabled={loading} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="pass">Password</Label>
                        <Input id="pass" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required />
                    </div>
                    <div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Sedang Memproses..." : "Mulai Validasi"}
                        </Button>
                    </div>
                </form>

                {loading && (
                    <div className="mt-8 flex flex-row items-center gap-2">
                        <LoadingSpinner />
                        <span className="text-xs">Sedang memproses...</span>
                    </div>
                )}

                {progress && (
                    <div className="mt-4">
                        <Progress value={(progress.current / progress.total) * 100} />
                        <p className="mt-1 text-gray-500">
                            {progress.current} dari {progress.total} mata kuliah
                        </p>
                    </div>
                )}

                {messages.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium">Status Proses:</h3>
                        <div className="mt-2 space-y-2">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index} //
                                    animate={{ opacity: [0, 1], y: [-12, 0] }}
                                    className="flex flex-row items-center gap-2"
                                >
                                    {msg.status == "progress" ? <LoadingSpinner /> : <CheckIcon />}
                                    <p
                                        className={`p-3 rounded-md ${
                                            msg.status === "error"
                                                ? " text-red-400"
                                                : msg.status === "warning"
                                                ? " text-yellow-400"
                                                : msg.status === "success"
                                                ? "" //
                                                : msg.status === "done"
                                                ? " text-black"
                                                : " text-blue-400"
                                        }`}
                                    >
                                        {msg.message}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {courses.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium">Daftar Mata Kuliah:</h3>
                        <div className="mt-2 space-y-1">
                            {courses.map(course => (
                                <div key={course.id} className={`p-2 rounded-md border ${completedCourses.includes(course.makul) ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                                    <div className="flex items-center justify-between">
                                        <span>{course.makul}</span>
                                        {completedCourses.includes(course.makul) && <span className="text-green-500 text-sm">✓ Selesai</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export const LoadingSpinner = ({ className }: { className?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
};
