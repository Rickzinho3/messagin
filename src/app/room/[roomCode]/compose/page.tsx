"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { readSession, Session } from "@/lib/session";
import { ArrowLeft3, ArrowRight3, Refresh } from "iconsax-reactjs";
import {
    heatMessageForHim,
    heatMessagesForHer,
    lightMessages,
    randomMessage,
} from "@/lib/messages";
import { Loader } from "@/components/motion/loader";

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
            <main className="min-h-screen w-full flex items-center justify-center font-mono text-sm text-[#a69b9d]">
                Abrindo compositor...
            </main>
        );
    const currentSession = session;

    function refreshMessage() {
        if (type === "light") {
            setMessage(randomMessage(lightMessages));
        } else if (type === "heat") {
            const heatList =
                currentSession.gender === "ele"
                    ? heatMessagesForHer
                    : heatMessageForHim;
            setMessage(randomMessage(heatList));
        }
    }

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
        <div className="min-h-screen w-full flex flex-col bg-[#100d10] text-[#f4eee9]">
            {/* Header Fixo */}
            <header className="sticky top-0 z-50 w-full h-15 backdrop-blur-xl bg-[#100d10]/75 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex justify-between items-center">
                <Link
                    href={`/room/${room}`}
                    className="text-mdtracking-wider text-[#a69b9d] hover:text-[#ffb0a7] transition-colors flex items-center gap-2"
                >
                    <ArrowLeft3 color="#a69b9d" size={17} /> <span className="text-[#a69b9d]">Voltar para sala</span>
                </Link>
                <span className="font-mono text-xs uppercase tracking-widest text-[#a69b9d]">{room}</span>
            </header>

            <main className="flex-1 w-full overflow-hidden max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-xs tracking-widest text-[#a69b9d]">
                        Compositor / {type}
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#f4eee9]">
                        O que você quer que apareça para <em>{currentSession.gender === "ele" ? "ela" : "ele"}</em> ?
                    </h1>
                    <p className="text-sm sm:text-base text-[#a69b9d] leading-relaxed">
                        Uma boa notificação chega curta, inesperada e impossível de ignorar.
                    </p>
                </div>

                <form
                    onSubmit={send}
                    className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-4 sm:p-8 shadow-2xl shadow-black/40 flex flex-col gap-6"
                >
                    <label className="flex flex-col gap-3 text-sm text-[#f4eee9]">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-[#a69b9d]">
                                Mensagem para <b className="text-[#f4eee9]">{session.otherName}</b>
                            </span>
                            {type !== "custom" && (
                                <button
                                    type="button"
                                    onClick={refreshMessage}
                                    className="flex items-center bg-gradient-to-r from-[#ee8b8d] to-[#ffb0a7] p-2 rounded-full gap-1.5 text-xs font-mono text-[#100d10] transition-colors cursor-pointer bg-transparent border-0"
                                >
                                    <Refresh size={17} color="#100d10" />
                                </button>
                            )}
                        </div>
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Digite seu sinal..."
                            maxLength={240}
                            disabled={type !== "custom"}
                            rows={4}
                            className="w-full bg-white/[0.05] border border-white/[0.12] rounded-2xl p-4 text-[#f4eee9] placeholder:text-white/30 focus:outline-none focus:border-[#ee8b8d] focus:ring-1 focus:ring-[#ee8b8d] transition-all resize-none"
                        />
                        <span className="text-[#a69b9d]">
                            {message.length}/240
                        </span>
                    </label>

                    <div className="flex justify-between items-center pt-2">
                        <button
                            className="bg-gradient-to-r from-[#ee8b8d] to-[#ffb0a7] text-[#100d10] w-full h-12  font-semibold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ee8b8d]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={sending}
                            type="submit"
                        >
                            {sending ? (<Loader variant="dots" size={20} />) : (<>Enviar <ArrowRight3 color="#100d10" size={20} /></>)}
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            {error}
                        </p>
                    )}
                </form>
            </main>
        </div>
    );
}
