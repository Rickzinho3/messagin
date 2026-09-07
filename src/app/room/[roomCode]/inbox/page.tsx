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
            <main className="page-frame loading-state">Abrindo inbox...</main>
        );

    return (
        <main className="page-frame inner-page">
            <header className="topbar">
                <Link href={`/room/${room}`} className="back-link">
                    ← voltar para sala
                </Link>
                <span className="room-label">{room} / inbox</span>
            </header>
            <section className="inbox-heading">
                <div>
                    <span className="eyebrow">CAIXA DE ENTRADA</span>
                    <h1>
                        O que chegou
                        <br />
                        <em>para você.</em>
                    </h1>
                </div>
                <button
                    className="button button-quiet"
                    onClick={() => loadMessages(session)}
                >
                    atualizar ↻
                </button>
            </section>
            {loading ? (
                <p className="empty-state">Buscando sinais...</p>
            ) : messages.length === 0 ? (
                <p className="empty-state">
                    Nenhuma mensagem nova.
                    <br />
                    <span>Quando chegar, ela aparece aqui.</span>
                </p>
            ) : (
                <section className="message-list">
                    {messages.map((message) => (
                        <article className="received-message" key={message.id}>
                            <div className="message-meta">
                                <span>de {message.from}</span>
                                <time>
                                    {new Date(
                                        message.createdAt,
                                    ).toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </time>
                            </div>
                            <p>{message.message}</p>
                            <button
                                className="text-button"
                                onClick={() => markRead(message.id)}
                            >
                                marcar como lida
                            </button>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}
