"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { readSession, Session } from "@/lib/session";

type Message = {
    id: string;
    from: string;
    message: string;
    type: string;
    createdAt: number;
};

export default function InboxPage() {
    const params = useParams<{ roomCode: string }>();
    const router = useRouter();
    const room = decodeURIComponent(params.roomCode);
    const [session, setSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMessages = useCallback(async (current: Session) => {
        const response = await fetch(
            `/api/notify?room=${encodeURIComponent(current.room)}&for=${encodeURIComponent(current.name)}`,
            { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Falha ao carregar inbox");
        const data = await response.json();
        setMessages(data.messages || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        const current = readSession();
        if (!current || current.room !== room) {
            router.replace("/");
            return;
        }
        setSession(current);
        loadMessages(current).catch(() => setLoading(false));
        const interval = window.setInterval(
            () => loadMessages(current).catch(() => undefined),
            8000,
        );
        return () => window.clearInterval(interval);
    }, [loadMessages, room, router]);

    async function markRead(id: string) {
        if (!session) return;
        await fetch("/api/notify", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room: session.room, id }),
        });
        setMessages((current) =>
            current.filter((message) => message.id !== id),
        );
    }

    if (!session)
        return (
            <main className="min-h-screen w-full flex items-center justify-center font-mono text-sm text-[#a69b9d]">
                Abrindo inbox...
            </main>
        );

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#100d10] text-[#f4eee9]">
            {/* Header Fixo */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#100d10]/75 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex justify-between items-center">
                <Link
                    href={`/room/${room}`}
                    className="text-xs font-mono uppercase tracking-wider text-[#a69b9d] hover:text-[#ffb0a7] transition-colors flex items-center gap-1.5"
                >
                    ← voltar para sala
                </Link>
                <span className="font-mono text-xs uppercase tracking-widest text-[#a69b9d]">{room} / inbox</span>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
                <section className="flex justify-between items-end gap-4 pb-6 border-b border-white/[0.08]">
                    <div className="flex flex-col gap-2">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#a69b9d]">
                            CAIXA DE ENTRADA
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#f4eee9]">
                            O que chegou
                            <br />
                            <em className="font-serif italic font-normal text-[#ffb0a7]">para você.</em>
                        </h1>
                    </div>
                    <button
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] font-mono text-xs uppercase tracking-wider text-[#a69b9d] hover:text-[#f4eee9] transition-all cursor-pointer"
                        onClick={() => loadMessages(session)}
                    >
                        atualizar ↻
                    </button>
                </section>

                {loading ? (
                    <div className="py-20 text-center font-mono text-sm text-[#a69b9d]">
                        Buscando sinais...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="py-20 text-center flex flex-col gap-2">
                        <p className="text-lg font-medium text-[#f4eee9]">Nenhuma mensagem nova.</p>
                        <span className="text-sm text-[#a69b9d]">Quando chegar, ela aparece aqui.</span>
                    </div>
                ) : (
                    <section className="flex flex-col gap-4">
                        {messages.map((message) => (
                            <article
                                className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col gap-4 shadow-lg shadow-black/20"
                                key={message.id}
                            >
                                <div className="flex justify-between items-center font-mono text-xs text-[#a69b9d] uppercase tracking-wider border-b border-white/[0.06] pb-3">
                                    <span className="text-[#ffb0a7]">de {message.from}</span>
                                    <time>
                                        {new Date(
                                            message.createdAt,
                                        ).toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </time>
                                </div>
                                <p className="text-lg text-[#f4eee9] leading-relaxed">
                                    {message.message}
                                </p>
                                <div className="flex justify-end pt-2">
                                    <button
                                        className="font-mono text-xs uppercase tracking-wider text-[#a69b9d] hover:text-[#ee8b8d] transition-colors cursor-pointer bg-transparent border-0"
                                        onClick={() => markRead(message.id)}
                                    >
                                        marcar como lida ✓
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}
