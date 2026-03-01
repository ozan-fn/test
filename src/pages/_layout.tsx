import "../styles.css";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
    return (
        <ThemeProvider defaultTheme="light" storageKey="hidup-jokowi">
            {children}
        </ThemeProvider>
    );
}

export const getConfig = async () => {
    return {
        render: "static",
    } as const;
};
