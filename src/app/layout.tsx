import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OneSignalBootstrap } from "@/components/OneSignalBootstrap";

export const metadata: Metadata = {
    title: "Notificações Safadas 🔥",
    description: "Lembrei de você e te mandei uma mensagem quente",
    manifest: "/manifest.json",
    icons: {
        icon: "/icon-192.png",
        apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Safadas",
    },
};

export const viewport: Viewport = {
    themeColor: "#100d10",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="theme-color" content="#100d10" />
            </head>
            <body>
                <OneSignalBootstrap />
                {children}
            </body>
        </html>
    );
}
