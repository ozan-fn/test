"use client";

import { Link } from "waku";
import { Counter } from "../../components/counter";

export default function HomePage() {
    return (
        <div className="max-w-7xl px-4 mx-auto w-full flex flex-col justify-center h-screen -mt-[54px]">
            <title>Makan nasi</title>
            <h1 className="text-4xl font-bold tracking-tight">{"hehe"}</h1>
            <p>{"hehe"}</p>
            <Counter />

            <Link to="/about" className="mt-4 inline-block underline">
                About page
            </Link>
        </div>
    );
}
