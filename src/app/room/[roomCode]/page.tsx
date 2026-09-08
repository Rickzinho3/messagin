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
import { ArrowRight3 } from "iconsax-reactjs";

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
        <div className="min-h-screen w-full flex flex-col bg-[#100d10] text-[#f4eee9]">
            {/* Header Fixo */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#100d10]/75 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex justify-between items-center">
                <Link href="/" className="font-mono text-xs uppercase tracking-widest text-[#f4eee9] hover:text-[#ffb0a7] transition-colors">
                    S / <span className="text-[#a69b9d]">private signal</span>
                </Link>
                <button
                    className="text-xs font-mono uppercase tracking-wider text-[#a69b9d] hover:text-[#ffb0a7] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
                    onClick={leave}
                >
                    sair da sala <ArrowRight3 color="#a69b9d" size={16} />
                </button>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10">
                <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex flex-col gap-2 max-w-xl">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#a69b9d]">
                            SALA PRIVADA
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#f4eee9]">
                            {session.name}, escolha o tom.
                        </h1>
                        <p className="text-sm sm:text-base text-[#a69b9d] leading-relaxed">
                            Envie um sinal para <strong className="text-[#f4eee9] font-semibold">{session.otherName}</strong>.
                            O código <b className="text-[#ffb0a7] font-mono tracking-wider">{session.room}</b> mantém vocês na mesma frequência.
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md self-start sm:self-auto">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#a69b9d]">ROOM</span>
                        <strong className="font-mono text-base tracking-widest text-[#ffb0a7]">{session.room}</strong>
                    </div>
                </section>

                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-[#a69b9d]">
                    <span className="w-2 h-2 rounded-full bg-[#b8e4bf] shadow-[0_0_10px_#b8e4bf] animate-pulse" />
                    {pushState}
                </div>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Leve */}
                    <Link
                        href={`/room/${room}/compose?type=light&message=${encodeURIComponent(randomMessage(lightMessages))}`}
                        className="group p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between gap-8 hover:-translate-y-1 shadow-lg shadow-black/20"
                    >
                        <div className="flex flex-col gap-4">
                            <span className="font-mono text-xs uppercase tracking-widest text-[#a69b9d]">
                                01 / LEVE
                            </span>
                            <strong className="text-xl sm:text-2xl font-semibold leading-snug text-[#f4eee9] group-hover:text-white transition-colors">
                                Uma lembrança
                                <br />
                                no meio do dia.
                            </strong>
                        </div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#a69b9d] group-hover:text-[#ffb0a7] flex items-center gap-1 transition-colors">
                            abrir sinal ↗
                        </span>
                    </Link>

                    {/* Intenso */}
                    <Link
                        href={`/room/${room}/compose?type=heat&message=${encodeURIComponent(randomMessage(heatList))}`}
                        className="group p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#ee8b8d]/10 to-transparent border border-[#ee8b8d]/30 hover:border-[#ee8b8d]/60 hover:shadow-xl hover:shadow-[#ee8b8d]/15 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between gap-8 hover:-translate-y-1"
                    >
                        <div className="flex flex-col gap-4">
                            <span className="font-mono text-xs uppercase tracking-widest text-[#ee8b8d]">
                                02 / INTENSO 🔥
                            </span>
                            <strong className="text-xl sm:text-2xl font-semibold leading-snug text-[#f4eee9] group-hover:text-[#ffb0a7] transition-colors">
                                Deixar a noite
                                <br />
                                mais interessante.
                            </strong>
                        </div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#ee8b8d] group-hover:text-[#ffb0a7] flex items-center gap-1 transition-colors">
                            abrir sinal ↗
                        </span>
                    </Link>

                    {/* Custom */}
                    <Link
                        href={`/room/${room}/compose?type=custom`}
                        className="group p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between gap-8 hover:-translate-y-1 shadow-lg shadow-black/20"
                    >
                        <div className="flex flex-col gap-4">
                            <span className="font-mono text-xs uppercase tracking-widest text-[#a69b9d]">
                                03 / SEU TEXTO
                            </span>
                            <strong className="text-xl sm:text-2xl font-semibold leading-snug text-[#f4eee9] group-hover:text-white transition-colors">
                                Escreva exatamente
                                <br />
                                o que pensa.
                            </strong>
                        </div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#a69b9d] group-hover:text-[#ffb0a7] flex items-center gap-1 transition-colors">
                            compor mensagem ↗
                        </span>
                    </Link>
                </section>

                <nav className="flex justify-between items-center pt-8 border-t border-white/[0.08] font-mono text-xs uppercase tracking-widest text-[#a69b9d]">
                    <Link
                        href={`/room/${room}/inbox`}
                        className="hover:text-[#ffb0a7] transition-colors flex items-center gap-1 text-[#f4eee9]"
                    >
                        caixa de entrada <span className="text-[#ffb0a7]">↗</span>
                    </Link>
                    <span className="text-white/40">notificações push ativas</span>
                </nav>
            </main>
        </div>
    );
}
