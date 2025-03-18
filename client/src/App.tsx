import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import Button from "./components/Button";
import Input from "./components/Input";
import Label from "./components/Label";
import axios from "axios";
import { IconBugFilled, IconInfoCircleFilled, IconLoader2, IconCheck, IconAlertTriangle } from "@tabler/icons-solidjs";
import { io, Socket } from "socket.io-client";

interface Message {
    id?: string;
    status: "loading" | "success" | "error" | "warning";
    message: string;
    timestamp?: number;
}

function App() {
    const [msgs, setMsgs] = createSignal<Message[]>([]);
    const [detailMsgs, setDetailMsgs] = createSignal<Message[]>([]);
    const [user, setUser] = createSignal("");
    const [pass, setPass] = createSignal("");
    const [isLoading, setIsLoading] = createSignal(false);
    const [lastNIM, setLastNIM] = createSignal(localStorage.getItem("lastNIM") || "");

    let socket: Socket;

    onMount(() => {
        socket = io(process.env.NODE_ENV == "development" ? "https://3000-ozanfn-absensiface-3em4y8v7crz.ws-us118.gitpod.io" : undefined);

        if (lastNIM()) {
            setUser(lastNIM());
        }

        onCleanup(() => {
            socket.close();
        });
    });

    createEffect(async () => {
        if (isLoading() && user() !== "") {
            const upperUser = user().toUpperCase();

            socket.on(upperUser, (data: Message) => {
                data.timestamp = Date.now();
                setMsgs(msgs => [...msgs.filter(msg => msg.id !== data.id), data]);
            });

            socket.on(upperUser + "-detail", (data: Message) => {
                data.timestamp = Date.now();
                setDetailMsgs(detailMsgs => [...detailMsgs.filter(msg => msg.id !== data.id), data]);
            });
        }
    });

    const handleSubmit = async () => {
        if (!user() || !pass()) return;

        setIsLoading(true);
        setMsgs([]);
        setDetailMsgs([]);

        localStorage.setItem("lastNIM", user());
        setLastNIM(user());

        try {
            await axios.post("/api/presensi", { username: user(), password: pass() });
        } catch (error) {
            if (!(error instanceof Error)) return;
            setMsgs([...msgs(), { status: "error", message: error.message, timestamp: Date.now() }]);
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "loading":
                return <IconLoader2 class="h-4 w-4 animate-spin" />;
            case "error":
                return <IconBugFilled class="h-4 w-4 text-red-500" />;
            case "warning":
                return <IconAlertTriangle class="h-4 w-4 text-yellow-500" />;
            case "success":
                return <IconCheck class="h-4 w-4 text-green-500" />;
            default:
                return <IconInfoCircleFilled class="h-4 w-4" />;
        }
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div class="font-aabeeze bg-gradient-to-br from-zinc-900 to-70% to-zinc-700 min-h-screen text-zinc-100 p-8 flex flex-col">
            <h3 class="text-2xl font-semibold">Automatic Presensi Amikom University</h3>

            <div class="mt-6 flex flex-col gap-4 max-w-md w-full">
                <Label htmlFor="username">Nomor Induk Mahasiswa</Label>
                <Input disabled={isLoading()} value={user()} onChange={e => setUser((e.target as HTMLInputElement).value)} id="username" placeholder="NIM" type="text" class="h-10" />

                <Label htmlFor="password">Password</Label>
                <Input disabled={isLoading()} onChange={e => setPass((e.target as HTMLInputElement).value)} id="password" placeholder="Password" type="password" class="h-10" />

                <div class="mt-2">
                    <Button disabled={isLoading()} onClick={handleSubmit}>
                        Mulai Presensi
                    </Button>
                </div>
            </div>

            <div class="mt-6 bg-zinc-900 overflow-auto border border-zinc-700 rounded-sm h-10 flex flex-1 flex-col gap-1 p-4">
                {msgs().map(v => (
                    <div class="flex flex-row gap-2">
                        <div class="h-6 w-4 flex justify-center items-center">{getStatusIcon(v.status)}</div>
                        <p class={v.status === "error" ? "text-red-500" : v.status === "warning" ? "text-yellow-500" : v.status === "success" ? "text-green-400" : ""}>{v.message}</p>
                        <span class="text-xs opacity-60 ml-auto shrink-0">{formatTime(v.timestamp)}</span>
                    </div>
                ))}
            </div>

            <Show when={detailMsgs().length > 0}>
                <div class="mt-4 bg-zinc-900 border border-zinc-700 rounded-sm p-4">
                    <h4 class="text-sm font-semibold mb-2">Detail Mata Kuliah</h4>
                    {detailMsgs().map(v => (
                        <div class="flex flex-row gap-2 text-sm">
                            <div class="h-5 w-4 flex justify-center items-center">{getStatusIcon(v.status)}</div>
                            <p class={v.status === "error" ? "text-red-500" : ""}>{v.message}</p>
                            <span class="text-xs opacity-60 ml-auto shrink-0">{formatTime(v.timestamp)}</span>
                        </div>
                    ))}
                </div>
            </Show>
        </div>
    );
}

export default App;
