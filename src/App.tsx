import axios from "axios";
import { useState } from "react";

function App() {
    const [url, setUrl] = useState("");
    const [embed, setEmbed] = useState("");

    async function ambil() {
        const res = await axios.head("/tiktok?url=" + url);
        if (res.statusText == "OK") {
            setEmbed("/tiktok?url=" + url);
        }
    }

    return (
        <div className="h-screen bg-gray-900 py-10 flex flex-col">
            <p className="text-3xl text-center font-semibold text-gray-300">Download video TikTok</p>

            <div className="flex flex-row items-center mt-8 justify-center">
                <input onChange={(e) => setUrl(e.target.value)} type="text" className="max-w-sm md:max-w-md h-10 w-full rounded-lg outline-none px-4 text-gray-700" />
                <button onClick={ambil} className="h-10 px-4 rounded-lg bg-gray-300 ml-4">
                    GO!
                </button>
            </div>

            <div className="relative flex flex-col max-w-md w-full self-center pt-8 flex-1">
                <a href={"/tiktok?url=" + url + "&download=true"} target="_blank" className="px-2 h-8 text-white border">
                    Download
                </a>
                <video src={embed} controls className="object-contain h-[50vh] mt-2"></video>
            </div>
        </div>
    );
}

export default App;
