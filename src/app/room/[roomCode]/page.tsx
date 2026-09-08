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
import { ArrowLeft3, ArrowRight3, DirectInbox, DirectRight, Edit2, Heart, HeartEdit, Lovely } from "iconsax-reactjs";

export default function RoomPage() {
    const params = useParams<{ roomCode: string }>();
    const router = useRouter();
    const room = decodeURIComponent(params.roomCode);
    const [session, setSession] = useState<Session | null>(null);
    const [hasUnread, setHasUnread] = useState(false);
    const [pushState, setPushState] = useState("Conectando seu dispositivo...");
    useEffect(() => {
        // Load session and verify it matches the room
        const current = readSession();
        if (!current || current.room !== room) {
            router.replace("/");
            return;
        }
        setSession(current);
        // Function to check unread messages
        const checkUnread = async (sess: Session) => {
            const res = await fetch(`/api/notify/unread/count?room=${encodeURIComponent(sess.room)}&for=${encodeURIComponent(sess.name)}`);
            if (res.ok) {
                const { unread } = await res.json();
                setHasUnread(unread > 0);
            }
        };
        // Initial check and set interval
        checkUnread(current);
        const interval = window.setInterval(() => {
            checkUnread(current);
        }, 8000);
        // Initialize push notifications
        connectPush(current.room, current.name);
        setPushState("Seu dispositivo está pronto para receber sinais");
        return () => window.clearInterval(interval);
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
            <header className="sticky top-0 z-50 h-15 w-full backdrop-blur-md bg-[#100d10]/75 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex justify-between items-center">
                <button
                    className="text-xs font-mono tracking-wider text-[#a69b9d] hover:text-[#ffb0a7] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
                    onClick={leave}
                >
                    <ArrowLeft3 color="#a69b9d" size={16} /> Sair da sala
                </button>
                <Link href={`/room/${room}/inbox`} className="relative font-mono text-xs uppercase tracking-widest text-[#f4eee9] hover:text-[#ffb0a7] transition-colors">
                    <DirectInbox color="#a69d9d" className="size-6"/>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </Link>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10">
                <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex flex-col gap-2 max-w-xl">
                        <h1 className="text-3xl sm:text-7xl max-w-100 font-bold tracking-tight text-[#f4eee9]">
                            {session.name}, <em className="font-serif italic text-7xl font-normal text-[#ffb0a7]">escolha o tom.</em>
                        </h1>
                        <p className="text-sm sm:text-base text-[#a69b9d] leading-relaxed">
                            Envie um sinal para <strong className="text-[#ffb0a7] font-semibold">{session.otherName}</strong>.
                            O código <b className="text-[#ffb0a7] font-mono tracking-wider">{session.room}</b> mantém vocês na mesma frequência.
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Leve */}
                    <Link
                        href={`/room/${room}/compose?type=light&message=${encodeURIComponent(randomMessage(lightMessages))}`}
                        className="group p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-emerald-200/20 to-transparent border border-emerald-200/20 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between gap-8 hover:-translate-y-1 shadow-lg shadow-black/20"
                    >
                        <div className="flex flex-col gap-4">
                            <span className="flex items-center gap-1 text-xs tracking-widest text-[#a69b9d]">
                                Leve <Heart color="#a69b9d" size={14}/>
                            </span>
                            <strong className="text-xl sm:text-2xl font-semibold leading-snug text-[#f4eee9] group-hover:text-white transition-colors">
                                Uma lembrança
                                <br />
                                no meio do dia.
                            </strong>
                        </div>
                    </Link>

                    {/* Intenso */}
                    <Link
                        href={`/room/${room}/compose?type=heat&message=${encodeURIComponent(randomMessage(heatList))}`}
                        className="group p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#ee8b8d]/10 to-transparent border border-[#ee8b8d]/30 hover:border-[#ee8b8d]/60 hover:shadow-xl hover:shadow-[#ee8b8d]/15 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between gap-8 hover:-translate-y-1"
                    >
                        <div className="flex flex-col gap-4">
                            <span className="flex items-center gap-1 text-xs tracking-widest text-[#ee8b8d]">
                                Quente <Lovely color="#ee8b8d" size={14}/>
                            </span>
                            <strong className="text-xl sm:text-2xl font-semibold leading-snug text-[#f4eee9] group-hover:text-[#ffb0a7] transition-colors">
                                Deixar a noite
                                <br />
                                mais interessante.
                            </strong>
                        </div>
                    </Link>

                    {/* Custom */}
                    <Link
                        href={`/room/${room}/compose?type=custom`}
                        className="group p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between gap-8 hover:-translate-y-1 shadow-lg shadow-black/20"
                    >
                        <div className="flex flex-col gap-4">
                            <span className="flex items-center gap-1 text-xs tracking-widest text-[#a69b9d]">
                                Personalizado <Edit2 color="#a69b9d" size={14}/>
                            </span>
                            <strong className="text-xl sm:text-2xl font-semibold leading-snug text-[#f4eee9] group-hover:text-white transition-colors">
                                Escreva exatamente
                                <br />
                                o que pensa.
                            </strong>
                        </div>
                    </Link>
                </section>
                {/* <nav className="flex justify-between items-center pt-8 border-t border-white/[0.08] font-mono text-xs uppercase tracking-widest text-[#a69b9d]">
                    <Link
                        href={`/room/${room}/inbox`}
                        className="hover:text-[#ffb0a7] transition-colors flex items-center gap-1 text-[#f4eee9]"
                    >
                        caixa de entrada <span className="text-[#ffb0a7]">↗</span>
                    </Link>
                    <span className="text-white/40">notificações push ativas</span>
                </nav> */}
            </main>
        </div>
    );
}
