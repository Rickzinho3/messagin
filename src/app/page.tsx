"use client";

import { useState, useEffect, useCallback } from "react";

type Screen = "login" | "home" | "preview" | "sent" | "custom" | "inbox";

type Target = "ela" | "ele";

const mensagensLeves = [
    "Você não sai da minha cabeça 😫",
    "Tô pensando em você agora mesmo...",
    "Só de lembrar de você já fico sorrindo 😌",
    "Queria estar do seu lado nesse momento",
    "Você me deixa com vontade de coisas boas...",
    "Saudade de ouvir sua voz",
    "Me manda um oi quando puder, tô aqui te esperando",
    "Você é meu pensamento favorito do dia",
    "Não consigo parar de pensar na gente",
    "Queria te dar um beijo agora 💋",
    "Meu dia fica melhor só de lembrar de você",
    "Tô com uma vontade louca de te abraçar bem apertado",
];

const mensagensQuentesEla = [
    "Quero foder essa sua buceta até ela ficar inchada e escorrendo porra",
    "Vou te engolir inteira, chupar esse clitóris até você squirtar na minha cara",
    "Se ajoelha e enfia minha rola até o fundo da sua garganta, quero te ver babando",
    "Hoje eu vou arrombar esse seu cuzinho apertado enquanto esfrego sua xota",
    "Quero te ver de quatro gemendo alto enquanto eu te como sem dó",
    "Sua buceta vai ficar marcada com o formato da minha pica, sua putinha",
    "Vou te amarrar e te usar como brinquedo a noite inteira, sem pausa",
    "Me manda um vídeo se tocando e falando que essa buceta é só minha",
    "Quero sentir seu gozo escorrendo pelas minhas bolas enquanto te fodo fundo",
    "Vou te encher de porra em todos os buracos até você não aguentar mais",
    "Sua xota latejando de tesão já tá me deixando duro pra caralho",
    "Quero te foder no espelho pra você ver essa cara de puta gozando",
    "Vou te chupar tão forte que você vai gozar só com a língua",
    "Me usa, monta nessa rola e rebola até eu gozar dentro de você",
    "Hoje você vai sair mancando de tanto eu te comer gostoso",
];

const mensagensQuentesEle = [
    "Quero chupar essa sua pica até você gozar tudo na minha garganta",
    "Vou sentar gostoso nessa rola e rebolar até você gemer meu nome alto",
    "Me fode com força, quero sentir essa pica latejando dentro da minha buceta",
    "Quero lamber suas bolas e chupar a cabeça da sua pica bem devagar",
    "Vou te dar o cuzinho apertado e te deixar gozar bem fundo em mim",
    "Me deixa de quatro e enfia essa rola com tudo, sem dó nenhuma",
    "Quero sentir você gozando quente dentro de mim enquanto eu aperto",
    "Vou te masturbar bem gostoso e chupar até a última gota",
    "Senta na minha cara e me faz engolir sua pica até o fundo",
    "Quero que você me use como sua putinha particular a noite toda",
    "Me enche de porra, quero escorrer pelos meus seios e pela boca",
    "Vou te cavalgar tão forte que você vai gozar mais de uma vez",
    "Chupa meus peitos enquanto eu esfrego essa buceta molhada na sua pica",
    "Quero você me fodendo de pé, me segurando pelo pescoço",
    "Me manda um áudio gemendo e falando que vai me foder sem piedade",
];

interface ReceivedMessage {
    id: string;
    from: string;
    to: string;
    message: string;
    type: string;
    createdAt: number;
}

// ============ COLOQUE AQUI A SUA VAPID PUBLIC KEY ============
// Gere com: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY =
    "BP2w0J1fyTos6Vo_AXlGtbY5qofRD9ckv6RLWhxCS2g-8Kpr7qQ_AZ38EbJE4GPvHkwGfoXfs06ry56hg29mll0";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function Home() {
    const [screen, setScreen] = useState<Screen>("login");
    const [meuNome, setMeuNome] = useState("");
    const [gender, setGender] = useState("ele");
    const [outroNome, setOutroNome] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [mensagemAtual, setMensagemAtual] = useState("");
    const [tipoAtual, setTipoAtual] = useState<"leve" | "quente" | "custom">(
        "leve",
    );
    const [target, setTarget] = useState<Target>("ela");
    const [customText, setCustomText] = useState("");
    const [inbox, setInbox] = useState<ReceivedMessage[]>([]);
    const [sending, setSending] = useState(false);
    const [pushStatus, setPushStatus] = useState<string>("");

    function gerarCodigo() {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomCode(code);
    }

    async function ativarPushNotifications(nome: string, sala: string) {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            setPushStatus("Seu navegador não suporta notificações push");
            return;
        }

        try {
            const registration =
                await navigator.serviceWorker.register("/sw.js");
            console.log("Service Worker registrado");

            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setPushStatus("Permissão de notificação negada 😕");
                return;
            }

            if (!VAPID_PUBLIC_KEY.trim()) {
                setPushStatus(
                    "⚠️ Coloque sua VAPID Public Key no código (page.tsx) para ativar push real",
                );
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            const response = await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "subscribe",
                    room: sala,
                    user: nome,
                    subscription: subscription.toJSON(),
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Falha ao salvar subscription (${response.status})`,
                );
            }

            setPushStatus("✅ Notificações na barra de status ativadas!");
        } catch (err) {
            console.error(err);
            setPushStatus("Erro ao ativar notificações");
        }
    }

    const checkMessages = useCallback(async () => {
        if (!roomCode || !meuNome) return;
        try {
            const res = await fetch(
                `/api/notify?room=${encodeURIComponent(roomCode)}&for=${encodeURIComponent(meuNome)}`,
            );
            if (res.ok) {
                const data = await res.json();
                if (data.messages && data.messages.length > 0) {
                    setInbox((prev) => {
                        const ids = new Set(prev.map((m) => m.id));
                        const novas = data.messages.filter(
                            (m: ReceivedMessage) => !ids.has(m.id),
                        );
                        return [...novas, ...prev].slice(0, 30);
                    });
                }
            }
        } catch (e) {
            console.error("Erro ao buscar mensagens", e);
        }
    }, [roomCode, meuNome]);

    useEffect(() => {
        if (screen === "home" || screen === "inbox") {
            checkMessages();
            const interval = setInterval(checkMessages, 4000);
            return () => clearInterval(interval);
        }
    }, [screen, checkMessages]);

    async function entrar() {
        const normalizedGender = gender.trim().toLocaleLowerCase();
        if (
            !meuNome.trim() ||
            !outroNome.trim() ||
            !roomCode.trim() ||
            !["ele", "ela"].includes(normalizedGender)
        ) {
            alert(
                "Preenche nome, nome da pessoa, seu gênero (ele/ela) e o código da sala 😏",
            );
            return;
        }
        setScreen("home");
        ativarPushNotifications(meuNome.trim(), roomCode.trim());
    }

    function escolherLeve() {
        const msg =
            mensagensLeves[Math.floor(Math.random() * mensagensLeves.length)];
        setMensagemAtual(msg);
        setTipoAtual("leve");
        setScreen("preview");
    }

    function escolherQuente(t: Target) {
        setTarget(t);
        const lista = t === "ela" ? mensagensQuentesEla : mensagensQuentesEle;
        const msg = lista[Math.floor(Math.random() * lista.length)];
        setMensagemAtual(msg);
        setTipoAtual("quente");
        setScreen("preview");
    }

    function abrirCustom() {
        setCustomText("");
        setScreen("custom");
    }

    function confirmarCustom() {
        if (!customText.trim()) {
            alert("Escreve alguma safadeza primeiro 😈");
            return;
        }
        setMensagemAtual(customText.trim());
        setTipoAtual("custom");
        setScreen("preview");
    }

    async function enviar() {
        setSending(true);
        try {
            const res = await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room: roomCode,
                    from: meuNome,
                    to: outroNome,
                    message: mensagemAtual,
                    type: tipoAtual,
                }),
            });

            if (res.ok) {
                setScreen("sent");
            } else {
                alert("Erro ao enviar. Tenta de novo.");
            }
        } catch {
            alert("Erro de conexão. O servidor tá rodando?");
        } finally {
            setSending(false);
        }
    }

    function voltarHome() {
        setScreen("home");
        setMensagemAtual("");
        setCustomText("");
    }

    async function marcarLida(id: string) {
        try {
            await fetch("/api/notify", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room: roomCode, id }),
            });
            setInbox((prev) => prev.filter((m) => m.id !== id));
        } catch {}
    }

    if (screen === "login") {
        return (
            <div className="container">
                <div className="card">
                    <h1 className="title">Notificações Safadas 🔥</h1>
                    <p className="subtitle">
                        Crie um código de sala e compartilhe com a pessoa.
                        <br />
                        Vocês dois precisam usar o <strong>mesmo código</strong>
                        .
                    </p>

                    <label
                        style={{
                            display: "block",
                            marginBottom: 6,
                            fontSize: 14,
                        }}
                    >
                        Seu nome
                    </label>
                    <input
                        placeholder="Ex: João"
                        value={meuNome}
                        onChange={(e) => setMeuNome(e.target.value)}
                        style={{ marginBottom: 14 }}
                    />

                    <label
                        style={{
                            display: "block",
                            marginBottom: 6,
                            fontSize: 14,
                        }}
                    >
                        Nome da pessoa
                    </label>
                    <input
                        placeholder="Ex: Maria"
                        value={outroNome}
                        onChange={(e) => setOutroNome(e.target.value)}
                        style={{ marginBottom: 14 }}
                    />

                    <label
                        style={{
                            display: "block",
                            marginBottom: 6,
                            fontSize: 14,
                        }}
                    >
                        Você é
                    </label>
                    <input
                        type="text"
                        placeholder="ele/ela"
                        style={{ marginBottom: 14 }}
                        onChange={(e) => setGender(e.target.value)}
                    />

                    <label
                        style={{
                            display: "block",
                            marginBottom: 6,
                            fontSize: 14,
                        }}
                    >
                        Código da sala (mesmo pros dois)
                    </label>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input
                            placeholder="Ex: SAFADA69"
                            value={roomCode}
                            onChange={(e) =>
                                setRoomCode(e.target.value.toUpperCase())
                            }
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={gerarCodigo}
                            style={{
                                background: "#5a189a",
                                color: "white",
                                padding: "0 16px",
                                borderRadius: 12,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Gerar
                        </button>
                    </div>

                    <button className="btn-primary" onClick={entrar}>
                        Entrar na sala 🔥
                    </button>

                    <p className="small">
                        Ao entrar, o app vai pedir permissão pra enviar
                        notificações na barra de status.
                    </p>
                </div>
            </div>
        );
    }

    if (screen === "inbox") {
        return (
            <div className="container">
                <div className="card">
                    <h1 className="title">Caixa de entrada 📩</h1>
                    <p className="subtitle">
                        Mensagens recebidas de {outroNome} (sala: {roomCode})
                    </p>

                    {inbox.length === 0 ? (
                        <p
                            style={{
                                textAlign: "center",
                                opacity: 0.7,
                                padding: "30px 0",
                            }}
                        >
                            Nenhuma mensagem nova ainda...
                            <br />
                            Manda uma safadeza primeiro 😈
                        </p>
                    ) : (
                        inbox.map((msg) => (
                            <div
                                key={msg.id}
                                className="message-box"
                                style={{
                                    marginBottom: 16,
                                    textAlign: "left",
                                    fontSize: "1rem",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        opacity: 0.7,
                                        marginBottom: 6,
                                    }}
                                >
                                    De: <strong>{msg.from}</strong> •{" "}
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                        "pt-BR",
                                    )}
                                </div>
                                {msg.message}
                                <button
                                    className="btn-secondary"
                                    style={{ marginTop: 12 }}
                                    onClick={() => marcarLida(msg.id)}
                                >
                                    Marcar como lida
                                </button>
                            </div>
                        ))
                    )}

                    <button className="btn-primary" onClick={voltarHome}>
                        Voltar
                    </button>
                    <button className="btn-secondary" onClick={checkMessages}>
                        Atualizar agora
                    </button>
                </div>
            </div>
        );
    }

    if (screen === "sent") {
        return (
            <div className="container">
                <div className="card success">
                    <h2>Enviado com sucesso 💦</h2>
                    <p style={{ marginBottom: 20, opacity: 0.85 }}>
                        A notificação foi enviada pra{" "}
                        <strong>{outroNome}</strong> na sala{" "}
                        <strong>{roomCode}</strong>.
                        <br />
                        Se a pessoa ativou as notificações, deve chegar na barra
                        de status também.
                    </p>
                    <div className="message-box" style={{ fontSize: "1rem" }}>
                        “{mensagemAtual}”
                    </div>
                    <button className="btn-primary" onClick={voltarHome}>
                        Mandar outra
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => setScreen("inbox")}
                    >
                        Ver caixa de entrada
                    </button>
                </div>
            </div>
        );
    }

    if (screen === "custom") {
        return (
            <div className="container">
                <div className="card">
                    <h1 className="title">Notificação Personalizada</h1>
                    <p className="subtitle">
                        Escreve o que você quer mandar pra {outroNome}
                    </p>

                    <textarea
                        rows={5}
                        placeholder="Ex: Quero te foder até você gritar meu nome e escorrer toda..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        style={{ marginBottom: 16, resize: "vertical" }}
                    />

                    <button className="btn-primary" onClick={confirmarCustom}>
                        Ver prévia
                    </button>
                    <button className="btn-secondary" onClick={voltarHome}>
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    if (screen === "preview") {
        return (
            <div className="container">
                <div className="card">
                    <div style={{ textAlign: "center" }}>
                        {tipoAtual === "leve" && (
                            <span className="tag tag-leve">LEVE 😌</span>
                        )}
                        {tipoAtual === "quente" && (
                            <span className="tag tag-quente">
                                QUENTE 🔥{" "}
                                {target === "ela" ? "(pra ela)" : "(pra ele)"}
                            </span>
                        )}
                        {tipoAtual === "custom" && (
                            <span className="tag tag-custom">
                                PERSONALIZADA
                            </span>
                        )}
                    </div>

                    <h2
                        style={{
                            textAlign: "center",
                            margin: "12px 0 4px",
                            fontSize: "1.1rem",
                        }}
                    >
                        Pra {outroNome}
                    </h2>
                    <p className="small" style={{ marginBottom: 8 }}>
                        De: {meuNome} • Sala: {roomCode}
                    </p>

                    <div className="message-box">{mensagemAtual}</div>

                    <button
                        className="btn-primary"
                        onClick={enviar}
                        disabled={sending}
                    >
                        {sending ? "Enviando..." : "Enviar notificação 😈"}
                    </button>
                    <button className="btn-secondary" onClick={voltarHome}>
                        Escolher outra
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <h1 className="title">Oi, {meuNome} 🔥</h1>
                <p className="subtitle">
                    Sala: <strong>{roomCode}</strong>
                    <br />O que você quer mandar pra{" "}
                    <strong>{outroNome}</strong>?
                </p>

                {pushStatus && (
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: 13,
                            marginBottom: 16,
                            padding: "8px 12px",
                            background: "rgba(255,255,255,0.08)",
                            borderRadius: 10,
                        }}
                    >
                        {pushStatus}
                    </p>
                )}

                {inbox.length > 0 && (
                    <button
                        className="btn-custom"
                        style={{
                            background:
                                "linear-gradient(135deg, #ff6b35, #f7c59f)",
                            color: "#1a0a0a",
                            marginBottom: 16,
                        }}
                        onClick={() => setScreen("inbox")}
                    >
                        📩 Você tem {inbox.length} mensagem(ns) nova(s)!
                    </button>
                )}

                <button className="btn-leve" onClick={escolherLeve}>
                    😌 Notificação Leve
                </button>

                {/* <button
                    className="btn-quente"
                    onClick={() => escolherQuente("ela")}
                >
                    🔥 Quente pra ela (bem suja)
                </button>

                <button
                    className="btn-quente"
                    onClick={() => escolherQuente("ele")}
                >
                    🔥 Quente pra ele (bem suja)
                </button> */}
                {gender.trim() == "ele" ? (
                    <button
                        className="btn-quente"
                        onClick={() => escolherQuente("ela")}
                    >
                        🔥 Quente pra ela (bem suja)
                    </button>
                ) : (
                    <button
                        className="btn-quente"
                        onClick={() => escolherQuente("ele")}
                    >
                        🔥 Quente pra ele (bem suja)
                    </button>
                )}

                <button className="btn-custom" onClick={abrirCustom}>
                    ✏️ Personalizada
                </button>

                <button
                    className="btn-secondary"
                    onClick={() => setScreen("inbox")}
                >
                    📩 Caixa de entrada
                </button>

                <p className="small">
                    As mensagens quentes são listas 100% diferentes entre “pra
                    ela” e “pra ele”.
                    <br />
                    Compartilha o código da sala com a pessoa e divirtam-se 😈
                </p>
            </div>
        </div>
    );
}
