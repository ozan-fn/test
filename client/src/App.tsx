"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pusher from "pusher-js";

export default function App() {
    const [nim, setNim] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<
        Array<{
            message: string;
            status: "loading" | "progress" | "success" | "error" | "warning";
            timestamp: number;
        }>
    >([]);
    const [progress, setProgress] = useState<{
        current: number;
        total: number;
    } | null>(null);
    const [courses, setCourses] = useState<
        Array<{
            id: string;
            makul: string;
            count: number;
        }>
    >([]);
    const [completedCourses, setCompletedCourses] = useState<string[]>([]);

    const pusherRef = useRef<Pusher | null>(null);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            // Cleanup function to unsubscribe and disconnect when component unmounts
            if (channelRef.current) {
                channelRef.current.unbind_all();
                channelRef.current.unsubscribe();
            }
            if (pusherRef.current) {
                pusherRef.current.disconnect();
            }
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!nim || !password) return;

        // Reset state
        setLoading(true);
        setMessages([]);
        setProgress(null);
        setCourses([]);
        setCompletedCourses([]);

        // Unsubscribe from previous channel if exists
        if (channelRef.current) {
            channelRef.current.unbind_all();
            channelRef.current.unsubscribe();
        }

        // Create new Pusher instance
        if (pusherRef.current) {
            pusherRef.current.disconnect();
        }
        pusherRef.current = new Pusher("af98277e22dd8b41a76e", {
            cluster: "ap1",
        });

        // Subscribe to username-specific channel
        const channelName = `presensi-channel-${nim}`;
        channelRef.current = pusherRef.current.subscribe(channelName);

        // Listen for status updates
        channelRef.current.bind("presensi-status", (data: any) => {
            console.log("Received status update:", data);

            // Only process messages for this user
            if (data.username === nim) {
                // Add message to list
                setMessages(prev => [
                    ...prev,
                    {
                        message: data.message,
                        status: data.status,
                        timestamp: Date.now(),
                    },
                ]);

                // Update progress if available
                if (data.progress) {
                    setProgress(data.progress);
                }

                // Update courses if available
                if (data.courses) {
                    setCourses(data.courses);
                }

                // Add completed course if available
                if (data.completedCourse) {
                    setCompletedCourses(prev => [...prev, data.completedCourse.makul]);
                }

                // End loading state if process is complete or failed
                if (data.status === "success" || data.status === "error") {
                    setLoading(false);
                }
            }
        });

        // Listen for detail updates
        channelRef.current.bind("presensi-detail", (data: any) => {
            console.log("Received detail update:", data);
            // Add detail message to list
            setMessages(prev => [
                ...prev,
                {
                    message: data.message,
                    status: data.status === "completed" ? "success" : "progress",
                    timestamp: Date.now(),
                },
            ]);
        });

        try {
            // Send request to server
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
                        timestamp: Date.now(),
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
                    timestamp: Date.now(),
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
                    <div className="mt-8 flex items-center gap-2">
                        <LoadingSpinner />
                        <span>Sedang memproses...</span>
                    </div>
                )}

                {progress && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                        </div>
                        <p className="text-sm mt-1 text-gray-500">
                            {progress.current} dari {progress.total} mata kuliah
                        </p>
                    </div>
                )}

                {messages.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium">Status Proses:</h3>
                        <div className="mt-2 space-y-2">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-md ${
                                        msg.status === "error"
                                            ? "bg-red-100 text-red-800"
                                            : msg.status === "warning"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : msg.status === "success"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-blue-100 text-blue-800"
                                    }`}
                                >
                                    {msg.message}
                                </div>
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
