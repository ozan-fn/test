import { AnimationProps, motion } from "framer-motion";
import plantTree from "./assets/plant-tree-svgrepo-com.svg";
import wateringCan from "./assets/watering-can-svgrepo-com.svg";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const [isWatering, setIsWatering] = useState(false);

  const w: AnimationProps = { animate: { left: "-3rem", bottom: "0px" }, transition: { duration: 1.6, type: "spring", bounce: 0.4 } };
  const n: AnimationProps = { animate: { top: "-9rem", left: "-2rem", rotate: "45deg" }, transition: { duration: 1.6, type: "spring", bounce: 0.4 } };

  const handleClick = () => setIsWatering((p) => !p);
  const watering = isWatering ? n : w;

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to server");
    });

    socket.on("disconnect", () => {
      console.log("disconnected from server");
    });

    socket.on("v", (v) => {
      v = v !== "false";
      setIsWatering(v);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("v");
    };
  }, []);

  return (
    <>
      <motion.div layout className="flex h-screen overflow-hidden bg-gradient-to-br from-green-900 to-red-700">
        <motion.div layout transition={{ type: "spring" }} className="flex flex-1 bg-white/20 p-4">
          <motion.div layout className="container mx-auto flex flex-1 items-center justify-center">
            <motion.div className="relative">
              <motion.img src={plantTree} animate={{ y: [-30, 0, -30], x: ["3.6rem"] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }} className="w-full max-w-[16rem] md:max-w-sm"></motion.img>
              <motion.img onClick={handleClick} src={wateringCan} {...watering} className="absolute -right-36 bottom-0 w-32 cursor-pointer"></motion.img>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default App;
