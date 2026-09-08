"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { readSession, Session } from "@/lib/session";

export default function ComposePage() {
    const params = useParams<{ roomCode: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();
    const room = decodeURIComponent(params.roomCode);
    const [session, setSession] = useState<Session | null>(null);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("custom");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const current = readSession();
        if (!current || current.room !== room) {
            router.replace("/");
            return;
        }
        setSession(current);
        setMessage(searchParams.get("message") || "");
        setType(searchParams.get("type") || "custom");
    }, [room, router, searchParams]);

    if (!session)
        return (
            <main className="page-frame loading-state">
                Abrindo compositor...
            </main>
        );
    const currentSession = session;

    async function send(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!message.trim()) {
            setError("Escreva uma mensagem antes de enviar.");
            return;
        }
        setSending(true);
        setError("");
        try {
            const response = await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room,
                    from: currentSession.name,
                    to: currentSession.otherName,
                    message: message.trim(),
                    type,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Falha ao enviar");
            router.push(`/room/${room}?sent=${data.push}`);
        } catch (sendError) {
            setError(
                sendError instanceof Error
                    ? sendError.message
                    : "Não foi possível enviar.",
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <main className="page-frame inner-page">
            <header className="topbar">
                <Link href={`/room/${room}`} className="back-link">
                    ← voltar para sala
                </Link>
                <span className="room-label">{room}</span>
            </header>
            <section className="compose-layout">
                <div className="section-intro">
                    <span className="eyebrow">COMPOSITOR / {type}</span>
                    <h1>O que você quer que apareça para a pessoa?</h1>
                    <p>
                        Uma boa notificação chega curta, inesperada e impossível
                        de ignorar.
                    </p>
                </div>
                <form onSubmit={send} className="glass-panel compose-panel">
                    <label className="message-label">
                        Mensagem para <b>{session.otherName}</b>
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Digite seu sinal..."
                            maxLength={240}
                            autoFocus
                        />
                    </label>
                    <div className="composer-footer">
                        <span>{message.length}/240</span>
                        <button
                            className="button button-primary"
                            disabled={sending}
                        >
                            {sending ? "enviando..." : "enviar sinal ↗"}
                        </button>
                    </div>
                    {error && <p className="form-error">{error}</p>}
                </form>
            </section>
        </main>
    );
}
