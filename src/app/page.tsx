"use client";

import Image from "next/image";
import bg from "../assets/thomas-le-9yXQTSdy4Ao-unsplash.jpg";
import pottedPlant from "../assets/potted-plant_1fab4.png";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import mqtt from "mqtt";

export default function Home() {
    const [moisture, setMoisture] = useState(0);
    const [connected, setConnected] = useState(false);
    const [client, setClient] = useState<mqtt.MqttClient>();
    const [lastConnected, setLastConnected] = useState(new Date());
    const [isSiram, setIsSiram] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (new Date().getTime() - lastConnected.getTime() <= 1300) {
                setConnected(true);
            } else {
                setConnected(false);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [lastConnected]);

    useEffect(() => {
        const client = mqtt.connect("wss://a93bb6a45b2d4a60bbf254a374d0e89f.s1.eu.hivemq.cloud:8884/mqtt", { username: "ozan6825", password: "Akhmad6825" });
        setClient(client);

        client.on("connect", () => {
            console.log("Connected to MQTT broker");
            client.subscribe("sensor/soil_moisture");
            client.subscribe("ping/ok");
        });

        client.on("message", (topic, message) => {
            if (topic === "ping/ok") {
                setLastConnected(new Date());
            }
            if (topic === "sensor/soil_moisture") {
                setMoisture(parseFloat(message.toString()));
            }
        });

        client.on("offline", () => {
            setMoisture(0);
            console.log("Disconnected from MQTT broker");
        });

        client.on("error", (err) => {
            console.error("Connection error: ", err);
        });

        return () => {
            client.connected && client.end();
        };
    }, []);

    const handleSiram = () => {
        client?.publish("control/water", "s");
        setIsSiram(true);
        setTimeout(() => setIsSiram(false), 3000);
    };

    return (
        <div className="relative flex h-screen w-screen text-zinc-100">
            <Image alt="_" src={bg.src} width={1920} height={1280} quality={100} className="absolute h-full object-cover object-bottom" priority />
            <motion.div animate={{ opacity: [0, 1] }} transition={{ duration: 2 }} className="flex flex-1 flex-col gap-4 p-4 px-4 backdrop-blur-md md:px-0">
                <div className="container mx-auto flex flex-row rounded-md border border-white/30 bg-white/10 p-4">
                    <p className="backround bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-lg font-bold text-transparent">PENYIRAM TANAMAN OTOMATIS</p>
                </div>

                <div className="container mx-auto w-full">
                    <button className="ml-auto flex h-8 flex-row items-center gap-1 rounded-md border border-white/30 bg-white/10 px-2 text-xs">
                        <div className={`h-3 w-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
                        {connected ? "TERHUBUNG" : "TERPUTUS"}
                    </button>
                </div>

                <div className="container mx-auto">
                    <div className="flex max-h-[30vh] flex-col flex-nowrap gap-4 overflow-auto rounded-md border border-white/30 bg-white/10 p-4 md:flex-row">
                        <motion.div animate={{ y: ["-8px", "0px", "-8px"] }} transition={{ repeat: Infinity, delay: 0.8, duration: 2 }}>
                            <Image alt="_" src={pottedPlant.src} width={160} height={160} quality={100} />
                        </motion.div>

                        <div className="flex flex-1 flex-col gap-2">
                            <p className="text-2xl font-bold">KELOMPOK 1</p>
                            <p>
                                Selamat datang di dashboard Penyiram Tanaman Otomatis menggunakan ESP8266. Sistem ini dirancang untuk memantau dan mengontrol kelembaban tanah secara real-time, memastikan tanaman Anda mendapatkan
                                jumlah air yang tepat.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="container mx-auto text-xl font-semibold">TOMBOL AKSI</p>

                <div className="container mx-auto flex flex-row gap-4">
                    <motion.button onClick={handleSiram} disabled={!connected || isSiram || moisture <= 30} whileTap={{ scale: 0.95 }} className="border-md h-10 rounded-md bg-white/30 px-4 active:bg-white/50 disabled:bg-white/10">
                        SIRAM
                    </motion.button>

                    {/* <motion.button disabled whileTap={{ scale: 0.95 }} className="border-md h-10 rounded-md bg-white/30 px-4 active:bg-white/50 disabled:bg-white/10">
                        SEGERA
                    </motion.button> */}
                </div>

                <p className="container mx-auto text-xl font-semibold">INFO</p>

                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col gap-4 rounded-md border border-white/30 bg-white/10 p-4">
                        <div className="flex flex-row justify-between">
                            <p>KELEMBABAN</p>
                            <p>{moisture > 100 ? 100 : moisture}%</p>
                        </div>

                        <div className="relative h-4 w-full rounded-md border border-white/50">
                            <motion.div animate={{ width: `${moisture > 100 ? 100 : moisture}%` }} transition={{ duration: 2, type: "spring" }} className="absolute inset-0 rounded-md bg-white/70" />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto mt-auto flex flex-row rounded-md border border-white/30 bg-white/10 p-4">
                    <p className="text">baiklah. 👍</p>
                </div>
            </motion.div>
        </div>
    );
}
