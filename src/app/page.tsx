"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { connectPush } from "@/components/OneSignalBootstrap";
import { saveSession } from "@/lib/session";
import { ArrowRight3 } from "iconsax-reactjs";

export default function EntryPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [otherName, setOtherName] = useState("");
    const [room, setRoom] = useState("");
    const [gender, setGender] = useState<"ele" | "ela">("ele");
    const [error, setError] = useState("");

    function enter(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleanRoom = room.trim().toUpperCase();
        if (!name.trim() || !otherName.trim() || cleanRoom.length < 3) {
            setError(
                "Preencha os nomes e use um código de sala com pelo menos 3 caracteres.",
            );
            return;
        }

        const session = {
            name: name.trim(),
            otherName: otherName.trim(),
            room: cleanRoom,
            gender,
        };
        saveSession(session);
        connectPush(cleanRoom, name.trim());
        router.push(`/room/${encodeURIComponent(cleanRoom)}`);
    }

    return (
        <main className="min-h-screen w-full flex justify-center items-center px-4 sm:px-6 py-12 max-w-5xl lg:max-w-full lg:px-20 mx-auto">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <section className="flex flex-col gap-4 text-left">
                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-[#f4eee9] leading-[0.95]">
                        Uma mensagem.
                        <br />
                        <em className="font-serif italic font-normal text-[#ffb0a7]">Um arrepio.</em>
                    </h1>
                    <p className="text-[#a69b9d] text-base leading-relaxed max-w-md">
                        Crie uma sala íntima para enviar notificações que chegam na
                        hora certa.
                    </p>
                </section>

                <section className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#a69b9d]">
                            Abrir conexão
                        </span>
                    </div>

                    <form onSubmit={enter} className="flex flex-col gap-5">
                        <label className="flex flex-col gap-2 text-sm text-[#f4eee9]">
                            <span className="font-medium">Seu nome</span>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Como quer ser chamado?"
                                autoComplete="name"
                                className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 text-[#f4eee9] placeholder:text-white/30 focus:outline-none focus:border-[#ee8b8d] focus:ring-1 focus:ring-[#ee8b8d] transition-all"
                            />
                        </label>

                        <label className="flex flex-col gap-2 text-sm text-[#f4eee9]">
                            <span className="font-medium">Nome da pessoa</span>
                            <input
                                value={otherName}
                                onChange={(event) =>
                                    setOtherName(event.target.value)
                                }
                                placeholder="Quem vai receber?"
                                className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 text-[#f4eee9] placeholder:text-white/30 focus:outline-none focus:border-[#ee8b8d] focus:ring-1 focus:ring-[#ee8b8d] transition-all"
                            />
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            <label className="col-span-2 flex flex-col gap-2 text-sm text-[#f4eee9]">
                                <span className="font-medium">Código da sala</span>
                                <input
                                    value={room}
                                    onChange={(event) =>
                                        setRoom(event.target.value.toUpperCase())
                                    }
                                    placeholder="ex: AFTERDARK"
                                    className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 text-[#f4eee9] placeholder:text-white/30 focus:outline-none focus:border-[#ee8b8d] focus:ring-1 focus:ring-[#ee8b8d] transition-all uppercase tracking-wider"
                                />
                            </label>

                            <label className="col-span-1 flex flex-col gap-2 text-sm text-[#f4eee9]">
                                <span className="font-medium">Você é</span>
                                <select
                                    value={gender}
                                    onChange={(event) =>
                                        setGender(
                                            event.target.value as "ele" | "ela",
                                        )
                                    }
                                    className="w-full bg-[#181419] border border-white/[0.12] rounded-xl px-3 py-3 text-[#f4eee9] focus:outline-none focus:border-[#ee8b8d] transition-all"
                                >
                                    <option value="ele">ele</option>
                                    <option value="ela">ela</option>
                                </select>
                            </label>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                {error}
                            </p>
                        )}

                        <button
                            className="w-full bg-gradient-to-r from-[#ee8b8d] to-[#ffb0a7] text-[#100d10] font-semibold py-3.5 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ee8b8d]/20 cursor-pointer mt-2"
                            type="submit"
                        >
                            Entrar na sala <ArrowRight3 size={18} color="#100d10" />
                        </button>
                    </form>

                    <p className="text-xs text-[#a69b9d] text-center font-mono">
                        Ao entrar, o Android pedirá permissão para receber seus sinais.
                    </p>
                </section>
            </div>
        </main>
    );
}
