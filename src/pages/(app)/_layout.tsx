import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
    return (
        <div className="relative w-full min-h-screen flex flex-col">
            <Header />
            {children}
            <Footer />
        </div>
    );
}

export const getConfig = async () => {
    return {
        render: "static",
    } as const;
};
