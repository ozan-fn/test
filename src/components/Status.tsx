import { Wifi, Server } from "lucide-react"; // Ikon dari lucide-react
import mqttClient from "../mqttClient";
import { useEffect, useRef, useState } from "react";

export default function Status() {
    const [mqttConnected, setMqttConnected] = useState(false);
    const [esp8266Connected, setEsp8266Connected] = useState(false);
    const pingTimeRef = useRef(new Date()); // Gunakan useRef untuk menyimpan waktu terakhir ping

    useEffect(() => {
        const checkConnection = () => {
            setMqttConnected(mqttClient.connected);
            const timeDifference = new Date().getTime() - pingTimeRef.current.getTime();
            setEsp8266Connected(timeDifference <= 3000);
        };

        const intervalId = setInterval(checkConnection, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleMessage = (topic: string) => {
            if (topic === "ping") {
                pingTimeRef.current = new Date();
            }
        };

        mqttClient.on("message", handleMessage);

        return () => {
            mqttClient.off("message", handleMessage);
        };
    }, []);

    return (
        <div className="flex flex-row gap-4">
            {/* Status MQTT */}
            <div className="flex items-center gap-3 p-4 border border-zinc-700 rounded-lg w-64">
                <Server className="w-6 h-6 text-zinc-500" />
                <div className="flex-1">
                    <p className="text-sm">MQTT</p>
                    <div className="flex items-center justify-between mt-1">
                        {/* Teks Status */}
                        <span className="text-xs">{mqttConnected ? "Connected" : "Disconnected"}</span>
                        {/* Indikator Bulat */}
                        <div className={`w-3 h-3 rounded-full ${mqttConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                    </div>
                </div>
            </div>

            {/* Status ESP8266 */}
            <div className="flex items-center gap-3 p-4 border border-zinc-700 rounded-lg w-64">
                <Wifi className="w-6 h-6 text-zinc-500" />
                <div className="flex-1">
                    <p className="text-sm">ESP8266</p>
                    <div className="flex items-center justify-between mt-1">
                        {/* Teks Status */}
                        <span className="text-xs">{esp8266Connected ? "Connected" : "Disconnected"}</span>
                        {/* Indikator Bulat */}
                        <div className={`w-3 h-3 rounded-full ${esp8266Connected ? "bg-green-500" : "bg-red-500"}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
