import { NextRequest, NextResponse } from "next/server";

// ============================================================
//  COLOQUE AQUI AS SUAS CHAVES VAPID
//  Gere com o comando:  npx web-push generate-vapid-keys
// ============================================================
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

// Stores em memória (resetam quando o servidor reinicia)
const rooms = new Map<
    string,
    Array<{
        id: string;
        from: string;
        to: string;
        message: string;
        type: string;
        createdAt: number;
        read: boolean;
    }>
>();

// roomKey -> Map<userNameLower, PushSubscriptionJSON>
const subscriptions = new Map<string, Map<string, any>>();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // === Registrar subscription de push ===
        if (body.action === "subscribe") {
            const { room, user, subscription } = body;
            if (!room || !user || !subscription) {
                return NextResponse.json(
                    { error: "Dados incompletos" },
                    { status: 400 },
                );
            }
            const roomKey = room.toLowerCase().trim();
            if (!subscriptions.has(roomKey)) {
                subscriptions.set(roomKey, new Map());
            }
            subscriptions
                .get(roomKey)!
                .set(user.toLowerCase().trim(), subscription);
            console.log(`Subscription salva: ${user} na sala ${roomKey}`);
            return NextResponse.json({
                success: true,
                message: "Subscription salva",
            });
        }

        // === Enviar mensagem + tentar push ===
        const { room, from, to, message, type } = body;

        if (!room || !from || !to || !message) {
            return NextResponse.json(
                { error: "Dados incompletos" },
                { status: 400 },
            );
        }

        const roomKey = room.toLowerCase().trim();
        if (!rooms.has(roomKey)) {
            rooms.set(roomKey, []);
        }

        const msg = {
            id: crypto.randomUUID(),
            from,
            to,
            message,
            type: type || "custom",
            createdAt: Date.now(),
            read: false,
        };

        rooms.get(roomKey)!.push(msg);

        // Limita a 50 mensagens por room
        const list = rooms.get(roomKey)!;
        if (list.length > 50) {
            rooms.set(roomKey, list.slice(-50));
        }

        // Tenta enviar push notification para o destinatário
        try {
            const roomSubs = subscriptions.get(roomKey);
            const sub = roomSubs?.get(to.toLowerCase().trim());

            if (sub && VAPID_PRIVATE_KEY.trim() && VAPID_PUBLIC_KEY.trim()) {
                // Dynamic import pra não quebrar se web-push não estiver instalado
                const webpush = (await import("web-push")).default;
                webpush.setVapidDetails(
                    VAPID_SUBJECT,
                    VAPID_PUBLIC_KEY,
                    VAPID_PRIVATE_KEY,
                );

                await webpush.sendNotification(
                    sub,
                    JSON.stringify({
                        title: `🔥 ${from} lembrou de você`,
                        body:
                            message.length > 90
                                ? message.substring(0, 87) + "..."
                                : message,
                        url: "/",
                    }),
                );
                console.log(`Push enviado para ${to}`);
            } else {
                console.log(
                    "Push não enviado: chaves VAPID não configuradas ou usuário sem subscription",
                );
            }
        } catch (pushErr: any) {
            console.error("Erro ao enviar push:", pushErr?.message || pushErr);
            // Não falha o envio da mensagem se o push der erro
        }

        return NextResponse.json({ success: true, id: msg.id });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    const forUser = searchParams.get("for");

    if (!room) {
        return NextResponse.json(
            { error: "Room obrigatória" },
            { status: 400 },
        );
    }

    const roomKey = room.toLowerCase().trim();
    const list = rooms.get(roomKey) || [];

    let filtered = list;
    if (forUser) {
        filtered = list.filter(
            (m) => m.to.toLowerCase() === forUser.toLowerCase() && !m.read,
        );
    }

    return NextResponse.json({ messages: filtered });
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { room, id } = body;

        if (!room || !id) {
            return NextResponse.json(
                { error: "Dados incompletos" },
                { status: 400 },
            );
        }

        const roomKey = room.toLowerCase().trim();
        const list = rooms.get(roomKey) || [];
        const msg = list.find((m) => m.id === id);
        if (msg) {
            msg.read = true;
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Erro" }, { status: 500 });
    }
}
