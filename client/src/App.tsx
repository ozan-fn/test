"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pusher from "pusher-js";
import { Progress } from "./components/ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { CheckIcon, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface Message {
    id?: string;
    message: string;
    status: "info" | "loading" | "progress" | "success" | "error" | "warning" | "done";
}

interface Course {
    id: string;
    makul: string;
    count: number;
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
    const [courses, setCourses] = useState<Course[]>([]);
    const [completedCourses, setCompletedCourses] = useState<string[]>([]);
    const [failedCourses, setFailedCourses] = useState<string[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");

    const channelRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        return () => {
            if (channelRef.current) {
                channelRef.current.unbind_all();
                pusher.unsubscribe(channelRef.current.name);
            }
        };
    }, []);

    const setupPusherListeners = (channelName: string) => {
        pusher.connection.bind("connected", () => {
            setConnectionStatus("connected");
        });

        pusher.connection.bind("connecting", () => {
            setConnectionStatus("connecting");
        });

        pusher.connection.bind("disconnected", () => {
            setConnectionStatus("disconnected");
        });

        channelRef.current = pusher.subscribe(channelName);

        channelRef.current.bind("pusher:subscription_succeeded", () => {
            setMessages(prev => [...prev, { message: "Koneksi ke server berhasil", status: "success" }]);
        });

        channelRef.current.bind("pusher:subscription_error", () => {
            setMessages(prev => [...prev, { message: "Gagal terhubung ke server", status: "error" }]);
            setLoading(false);
        });

        channelRef.current.bind("presensi-status", (data: any) => {
            handleStatusUpdate(data);
        });

        channelRef.current.bind("presensi-detail", (data: any) => {
            handleDetailUpdate(data);
        });
    };

    const handleStatusUpdate = (data: any) => {
        if (data.id) {
            setMessages(prevMessages => {
                const index = prevMessages.findIndex(msg => msg.id === data.id);

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

        if (data.failedCourse) {
            setFailedCourses(prev => [...prev, data.failedCourse.makul]);
        }

        if (data.status === "done" || data.status === "error") {
            setLoading(false);
        }
    };

    const handleDetailUpdate = (data: any) => {
        if (data.id) {
            setMessages(prevMessages => {
                const index = prevMessages.findIndex(msg => msg.id === data.id);

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
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!nim || !password) return;

        setLoading(true);
        setMessages([]);
        setProgress(null);
        setCourses([]);
        setCompletedCourses([]);
        setFailedCourses([]);

        if (channelRef.current) {
            channelRef.current.unbind_all();
            pusher.unsubscribe(channelRef.current.name);
        }

        setupPusherListeners(nim.toUpperCase());

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "progress":
            case "loading":
                return <LoadingSpinner />;
            case "success":
            case "done":
                return <CheckIcon className="text-green-500" />;
            case "error":
                return <AlertCircle className="text-red-500" />;
            case "warning":
                return <AlertTriangle className="text-yellow-500" />;
            default:
                return <Info className="text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "error":
                return "text-red-500 bg-red-50";
            case "warning":
                return "text-yellow-500 bg-yellow-50";
            case "success":
                return "text-green-500 bg-green-50";
            case "done":
                return "text-black bg-green-50";
            default:
                return "text-blue-500 bg-blue-50";
        }
    };

    return (
        <main className="bg-background text-foreground min-h-screen flex flex-col p-8">
            <div className="max-w-7xl mx-auto flex-grow w-full">
                <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    Automatic Presensi Amikom University
                </motion.h2>

                <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-md flex flex-col gap-4 mt-6 w-full" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="nim">Nomor Induk Mahasiswa</Label>
                        <Input id="nim" value={nim} onChange={e => setNim(e.target.value)} disabled={loading} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="pass">Password</Label>
                        <Input id="pass" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required />
                    </div>
                    <motion.div whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Sedang Memproses..." : "Mulai Validasi"}
                        </Button>
                    </motion.div>
                </motion.form>

                {connectionStatus === "connecting" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex flex-row items-center gap-2">
                        <LoadingSpinner />
                        <span className="text-xs">Menghubungkan ke server...</span>
                    </motion.div>
                )}

                {progress && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="mt-4">
                        <Progress value={(progress.current / progress.total) * 100} />
                        <p className="mt-1 text-gray-500">
                            {progress.current} dari {progress.total} mata kuliah
                        </p>
                    </motion.div>
                )}

                {messages.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-6">
                        <h3 className="text-lg font-medium">Status Proses:</h3>
                        <div className="mt-2 space-y-2 max-h-96 overflow-y-auto pr-2">
                            <AnimatePresence>
                                {messages.map((msg, index) => (
                                    <motion.div
                                        key={`msg-${index}`}
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-row items-center gap-2"
                                    >
                                        {getStatusIcon(msg.status)}
                                        <p className={`p-3 rounded-md ${getStatusColor(msg.status)}`}>{msg.message}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>
                )}

                {courses.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6">
                        <h3 className="text-lg font-medium">Daftar Mata Kuliah:</h3>
                        <div className="mt-2 space-y-2">
                            <AnimatePresence>
                                {courses.map(course => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className={`p-3 rounded-md border ${
                                            completedCourses.includes(course.makul) ? "border-green-500 bg-green-50" : failedCourses.includes(course.makul) ? "border-red-500 bg-red-50" : "border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{course.makul}</span>
                                            {completedCourses.includes(course.makul) && (
                                                <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="text-green-500 text-sm flex items-center">
                                                    <CheckIcon className="h-4 w-4 mr-1" /> Selesai
                                                </motion.span>
                                            )}
                                            {failedCourses.includes(course.makul) && (
                                                <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="text-red-500 text-sm flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" /> Gagal
                                                </motion.span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
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
