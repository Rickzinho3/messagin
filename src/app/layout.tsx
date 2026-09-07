import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Notificações Safadas 🔥",
    description: "Lembrei de você e te mandei uma mensagem quente",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Safadas",
    },
};

export const viewport: Viewport = {
    themeColor: "#ff4d6d",
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
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
            </head>
            <body>{children}</body>
        </html>
    );
}
