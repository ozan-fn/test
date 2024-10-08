import { motion } from "framer-motion";
import pottedPlant from "./assets/potted-plant_1fab4.png";
import bg from "./assets/vital-sinkevich-LAKQ3i-xn84-unsplash.jpg";
import { useEffect, useState } from "react";
import { SiExpress, SiMongodb, SiReact, SiTailwindcss, SiTypescript } from "react-icons/si";
import { WifiIcon } from "lucide-react";
import client from "./mqqtClient";

function App() {
  const [pingResponse, setPingResponse] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState("");
  const [isSiram, setIsSiram] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(0);

  useEffect(() => {
    const checkOffline = setInterval(() => {
      if (pingResponse && new Date().getTime() - pingResponse.getTime() > 1000) {
        setIsOnline("");
        setSoilMoisture(0);
      }
    }, 1000); // Interval diperpanjang menjadi 2 detik

    return () => clearInterval(checkOffline);
  }, [pingResponse]);

  useEffect(() => {
    client.on("message", (topic, message) => {
      if (topic === "ping/response") {
        setPingResponse(new Date());
        setIsOnline(message.toString());
      }
      if (topic === "sensor/soil_moisture") {
        setSoilMoisture(Number(message.toString()));
      }
    });
  }, []);

  const sendWaterCommand = async () => {
    setIsSiram(true);
    client.publish("control/water", "ON");
    await new Promise((r) => setTimeout(r, 1000));
    setIsSiram(false);
  };

  return (
    <>
      <div className="flex h-screen font-poppins text-zinc-300" style={{ backgroundImage: `url(${bg})`, backgroundPositionY: "center", backgroundSize: "cover" }}>
        <div className="flex flex-1 flex-col gap-4 p-8 backdrop-blur-md">
          {/* CONTENT */}
          <div className="container mx-auto">
            <div className="flex h-[30vh] w-full flex-col gap-6 overflow-auto rounded-md border border-white/20 p-6 lg:flex-row">
              <div className="flex w-40 shrink-0 items-center justify-center">
                <img src={pottedPlant} className="h-full w-40" alt="" />
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-2xl font-semibold">KELOMPOK 1</p>
                <p>
                  Proyek ini bertujuan untuk mengembangkan sistem penyiraman tanaman otomatis yang memanfaatkan teknologi Internet of Things (IoT) dengan menggunakan modul ESP8266. Sistem ini dirancang untuk memantau dan mengelola
                  kebutuhan air tanaman secara efisien, sehingga dapat membantu menjaga kesehatan tanaman tanpa memerlukan intervensi manual yang berlebihan.
                </p>
              </div>
            </div>
          </div>

          <div className="container mx-auto flex flex-row items-center">
            <motion.button
              onClick={sendWaterCommand}
              disabled={!isOnline || isSiram}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring" }}
              className="h-10 w-fit rounded-md border border-white/20 bg-white/20 px-3 focus:bg-white/30"
            >
              <p>SIRAM</p>
            </motion.button>

            <motion.div className={`ml-3 flex h-10 w-fit select-none items-center justify-center rounded-md border border-white/20 bg-white/20 px-3 ${isOnline ? "text-green-50" : "text-red-50"}`}>
              <WifiIcon className={`h-4 w-4 ${isOnline ? "stroke-green-500" : "stroke-red-500"}`} />
              <p className="ml-2">{isOnline ? isOnline.toUpperCase() : "OFFLINE"}</p>
            </motion.div>
          </div>

          {/* <div className="container mx-auto overflow-auto rounded-md border border-white/20 text-left">
            <table className="table w-full text-sm">
              <thead className="rounded-md bg-white/20">
                <tr>
                  <th className="h-10 px-3 text-white/70">NO</th>
                  <th className="h-10 px-3 text-white/70">STATUS</th>
                  <th className="h-10 px-3 text-white/70">DURASI</th>
                  <th className="h-10 px-3 text-white/70">TANGGAL / JAM</th>
                </tr>
              </thead>
              <tbody className="">
                {Array.from({ length: 2 }).map((_, i) => {
                  return (
                    <motion.tr transition={{}} key={i} className="z-20">
                      <td className="h-10 whitespace-nowrap px-3">1.</td>
                      <td className="h-10 whitespace-nowrap px-3">BERHASIL</td>
                      <td className="h-10 whitespace-nowrap px-3">3 DETIK</td>
                      <td className="h-10 whitespace-nowrap px-3">04 SEPT 2024 / 20:18 WIB</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div> */}

          <p className="container mx-auto font-semibold">INFO</p>

          <div className="container mx-auto flex flex-1">
            <div className="flex h-fit w-full max-w-sm flex-col gap-2 rounded-md border border-white/20 p-4 md:max-w-md">
              <div className="flex flex-row justify-between">
                <p className="font-semibold">KELEMBABAN</p>
                <p className="font-semibold">{soilMoisture > 100 ? 100 : soilMoisture}%</p>
              </div>
              <div className="relative h-8 w-full">
                <div className="h-8 w-full rounded-md border border-white/20"></div>
                <motion.div initial={{ width: "0%" }} animate={{ width: `${soilMoisture > 100 ? 100 : soilMoisture}%` }} transition={{ duration: 2 }} className="absolute inset-0 rounded-md bg-white/70" />
              </div>
            </div>
          </div>

          <div className="container mx-auto mt-auto flex h-14 shrink-0 items-center justify-center gap-4 rounded-md border border-white/20 px-3">
            <SiTypescript fill="#3178C6" className="h-5 w-5" />
            <SiMongodb fill="#47A248" className="h-5 w-5" />
            <SiTailwindcss fill="#06B6D4" className="h-5 w-5" />
            <SiExpress fill="#ffffff" className="h-5 w-5" />
            <SiReact fill="#61DAFB" className="h-5 w-5" />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
