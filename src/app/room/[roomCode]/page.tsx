"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { connectPush } from "@/components/OneSignalBootstrap";
import {
    heatMessageForHim,
    heatMessagesForHer,
    lightMessages,
    randomMessage,
} from "@/lib/messages";
import { readSession, clearSession, Session } from "@/lib/session";

export default function RoomPage() {
    const params = useParams<{ roomCode: string }>();
    const router = useRouter();
    const room = decodeURIComponent(params.roomCode);
    const [session, setSession] = useState<Session | null>(null);
    const [pushState, setPushState] = useState("Conectando seu dispositivo...");

    useEffect(() => {
        const current = readSession();
        if (!current || current.room !== room) {
            router.replace("/");
            return;
        }
        setSession(current);
        connectPush(current.room, current.name);
        setPushState("Seu dispositivo está pronto para receber sinais");
    }, [room, router]);

    if (!session)
        return (
            <main className="page-frame loading-state">
                Abrindo sua sala...
            </main>
        );

    function leave() {
        clearSession();
        router.push("/");
    }

    const heatList =
        session.gender === "ele" ? heatMessagesForHer : heatMessageForHim;

    return (
        <main className="page-frame room-page">
            <header className="topbar">
                <Link href="/" className="brand-mark">
                    S / <span>private signal</span>
                </Link>
                <button className="text-button" onClick={leave}>
                    sair da sala
                </button>
            </header>
            <section className="room-hero">
                <div>
                    <span className="eyebrow">SALA PRIVADA</span>
                    <h1>{session.name}, escolha o tom.</h1>
                    <p>
                        Envie um sinal para <strong>{session.otherName}</strong>
                        . O código <b>{session.room}</b> mantém vocês na mesma
                        frequência.
                    </p>
                </div>
                <div className="room-orb">
                    <span>ROOM</span>
                    <strong>{session.room}</strong>
                </div>
            </section>
            <p className="push-banner">
                <span className="pulse" />
                {pushState}
            </p>
            <section className="action-grid">
                <Link
                    href={`/room/${room}/compose?type=light&message=${encodeURIComponent(randomMessage(lightMessages))}`}
                    className="signal-card signal-soft"
                >
                    <span className="card-index">01 / leve</span>
                    <strong>
                        Uma lembrança
                        <br />
                        no meio do dia.
                    </strong>
                    <span className="card-action">abrir sinal ↗</span>
                </Link>
                <Link
                    href={`/room/${room}/compose?type=heat&message=${encodeURIComponent(randomMessage(heatList))}`}
                    className="signal-card signal-hot"
                >
                    <span className="card-index">02 / intenso</span>
                    <strong>
                        Deixar a noite
                        <br />
                        mais interessante.
                    </strong>
                    <span className="card-action">abrir sinal ↗</span>
                </Link>
                <Link
                    href={`/room/${room}/compose?type=custom`}
                    className="signal-card signal-custom"
                >
                    <span className="card-index">03 / seu texto</span>
                    <strong>
                        Escreva exatamente
                        <br />o que pensa.
                    </strong>
                    <span className="card-action">compor mensagem ↗</span>
                </Link>
            </section>
            <nav className="room-nav">
                <Link href={`/room/${room}/inbox`}>
                    caixa de entrada <span>↗</span>
                </Link>
                <span>notificações push ativas</span>
            </nav>
        </main>
    );
}
