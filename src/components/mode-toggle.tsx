"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useRef } from "react";

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";
    const transitionRef = useRef<any>(null);

    const toggleTheme = () => {
        const nextTheme = isDark ? "light" : "dark";

        if (!document.startViewTransition) {
            setTheme(nextTheme);
            return;
        }

        if (transitionRef.current) {
            transitionRef.current.skipTransition();
        }

        // Tentukan arah berdasarkan tema saat ini
        // Jika dari light ke dark -> arah normal, jika sebaliknya -> arah reverse
        if (isDark) {
            document.documentElement.classList.add("transition-reverse");
        } else {
            document.documentElement.classList.remove("transition-reverse");
        }

        transitionRef.current = document.startViewTransition(() => {
            setTheme(nextTheme);
        });

        transitionRef.current.finished.finally(() => {
            transitionRef.current = null;
        });
    };

    return (
        <Button variant="outline" size="icon" onClick={toggleTheme} className="relative">
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
