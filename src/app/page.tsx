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
        <main className="page-frame entry-page">
            <section className="entry-copy">
                <h1>
                    Uma mensagem.
                    <br />
                    <em>Um arrepio.</em>
                </h1>
                <p>
                    Crie uma sala íntima para enviar notificações que chegam na
                    hora certa.
                </p>
            </section>
            <section className="glass-panel entry-panel">
                <div className="panel-heading">
                    <span className="panel-kicker">Abrir conexão</span>
                    <span className="status-dot">online</span>
                </div>
                <form onSubmit={enter} className="form-stack">
                    <label>
                        Seu nome
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Como quer ser chamado?"
                            autoComplete="name"
                        />
                    </label>
                    <label>
                        Nome da pessoa
                        <input
                            value={otherName}
                            onChange={(event) =>
                                setOtherName(event.target.value)
                            }
                            placeholder="Quem vai receber?"
                        />
                    </label>
                    <div className="form-row">
                        <label className="grow">
                            Código da sala
                            <input
                                value={room}
                                onChange={(event) =>
                                    setRoom(event.target.value.toUpperCase())
                                }
                                placeholder="ex: AFTERDARK"
                            />
                        </label>
                        <label className="select-label">
                            Você é
                            <select
                                value={gender}
                                onChange={(event) =>
                                    setGender(
                                        event.target.value as "ele" | "ela",
                                    )
                                }
                            >
                                <option value="ele">ele</option>
                                <option value="ela">ela</option>
                            </select>
                        </label>
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    <button className="button button-primary" type="submit">
                        Entrar na sala <ArrowRight3 color="#fff"/>
                    </button>
                </form>
                <p className="fine-print">
                    Ao entrar, o Android pedirá permissão para receber seus
                    sinais.
                </p>
            </section>
        </main>
    );
}
