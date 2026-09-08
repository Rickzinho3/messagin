"use client";

import { useEffect } from "react";
import Script from "next/script";
import { makeOneSignalId } from "@/lib/session";

declare global {
    interface Window {
        OneSignalDeferred?: Array<(oneSignal: OneSignalClient) => void>;
    }
}

type OneSignalClient = {
    init: (options: {
        appId: string;
        allowLocalhostAsSecureOrigin?: boolean;
    }) => Promise<void>;
    login: (externalId: string) => Promise<void>;
    Notifications: { requestPermission: () => Promise<boolean> };
};

export function OneSignalBootstrap() {
    useEffect(() => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
    }, []);

    return (
        <Script
            src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
            strategy="afterInteractive"
        />
    );
}

export function connectPush(room: string, name: string) {
    const appId =
        process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID?.trim() ||
        "1e493154-a38f-413e-8cde-de0c81524cbd";
    if (!appId || typeof window === "undefined") return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (oneSignal) => {
        try {
            await oneSignal.init({ appId, allowLocalhostAsSecureOrigin: true });
            await oneSignal.login(makeOneSignalId(room, name));
            await oneSignal.Notifications.requestPermission();
        } catch (e) {
            console.error("OneSignal push connect error:", e);
        }
    });
}
