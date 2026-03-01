import { ReactNode } from "react";

export default async function RootElement({ children }: { children: ReactNode }) {
    const data = await getData();

    return (
        <html lang="id">
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
(function () {
    try {
        var storageKey = "hidup-jokowi";
        var theme = localStorage.getItem(storageKey);
        
        if (!theme || theme === "system") {
            var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            theme = systemDark ? "dark" : "light";
        }
            
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
    } catch (e) {}
})();
                        `,
                    }}
                />
                <meta name="description" content={data.description} />
                <link rel="icon" type="image/png" href={data.icon} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400;1,700&display=swap" precedence="font" />
            </head>
            <body className="font-['Nunito']">{children}</body>
        </html>
    );
}

export const getConfig = async () => {
    return {
        render: "static",
    } as const;
};

const getData = async () => {
    const data = {
        description: "An internet website!",
        icon: "/images/favicon.png",
    };

    return data;
};
