import { NextRequest, NextResponse } from "next/server";
import {
    createMessage,
    listMessages,
    markMessageRead,
    toMessage,
} from "@/lib/server-data";

const oneSignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY;

function normalize(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function externalId(room: string, user: string) {
    return `${room.toLowerCase()}:${user.toLowerCase()}`;
}

async function sendOneSignalPush(input: {
    room: string;
    to: string;
    from: string;
    message: string;
}) {
    const oneSignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID?.trim();
    const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY?.trim();

    if (!oneSignalAppId || !oneSignalApiKey) {
        throw new Error("OneSignal não está configurado na Vercel");
    }

    const roomUrl = `https://messagin-sage.vercel.app/room/${input.room}`;

    const response = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
            Authorization: `Key ${oneSignalApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            app_id: oneSignalAppId,
            target_channel: "push",
            include_aliases: {
                external_id: [externalId(input.room, input.to)],
            },
            headings: { en: `${input.from} lembrou de você` },
            contents: {
                en:
                    input.message.length > 100
                        ? `${input.message.slice(0, 97)}...`
                        : input.message,
            },
            url: roomUrl,
            priority: 10,
            web_buttons: [
                {
                    id: "abrir-sala",
                    text: "Responder",
                    url: roomUrl
                },
                {
                    id: "ver-mensagem",
                    text: "Ver mensagem",
                    url: `${roomUrl}/inbox`
                }
            ]
        }),
    });

    if (!response.ok) {
        throw new Error(
            `OneSignal ${response.status}: ${await response.text()}`,
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const room = normalize(body.room).toUpperCase();
        const from = normalize(body.from);
        const to = normalize(body.to);
        const message = normalize(body.message);
        const type = normalize(body.type) || "custom";

        if (!room || !from || !to || !message) {
            return NextResponse.json(
                { error: "Dados incompletos" },
                { status: 400 },
            );
        }

        const row = await createMessage({ room, from, to, message, type });
        let push: "sent" | "failed" | "not_configured" = "not_configured";

        const oneSignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID?.trim();
        const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY?.trim();

        try {
            await sendOneSignalPush({ room, to, from, message });
            push = "sent";
        } catch (error) {
            push =
                oneSignalAppId && oneSignalApiKey ? "failed" : "not_configured";
            console.error("Falha no OneSignal:", error);
        }

        return NextResponse.json({ success: true, id: row?.id, push });
    } catch (error) {
        console.error("Falha ao criar mensagem:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
        return NextResponse.json(
            { error: `Não foi possível enviar: ${errorMessage}` },
            { status: 500 },
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;
        const room = normalize(params.get("room")).toUpperCase();
        const recipient = normalize(params.get("for"));

        if (!room || !recipient) {
            return NextResponse.json(
                { error: "Sala e destinatário são obrigatórios" },
                { status: 400 },
            );
        }

        const rows = await listMessages(room, recipient);
        return NextResponse.json({ messages: rows.map(toMessage) });
    } catch (error) {
        console.error("Falha ao listar mensagens:", error);
        return NextResponse.json(
            { error: "Não foi possível carregar mensagens" },
            { status: 500 },
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const room = normalize(body.room).toUpperCase();
        const id = normalize(body.id);

        if (!room || !id) {
            return NextResponse.json(
                { error: "Dados incompletos" },
                { status: 400 },
            );
        }

        await markMessageRead(room, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Falha ao marcar mensagem:", error);
        return NextResponse.json(
            { error: "Não foi possível marcar mensagem" },
            { status: 500 },
        );
    }
}
