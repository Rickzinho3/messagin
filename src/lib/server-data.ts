type MessageRow = {
    id: string;
    room_code: string;
    from_name: string;
    to_name: string;
    message: string;
    type: string;
    read_at: string | null;
    created_at: string;
};

function cleanEnvValue(value?: string) {
    if (!value) return "";
    return value.trim().replace(/^["']|["']$/g, "").trim();
}

function requireSupabase() {
    const rawUrl = cleanEnvValue(
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL,
    );
    const rawKey = cleanEnvValue(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    if (!rawUrl || !rawKey) {
        const missing: string[] = [];
        if (!rawUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
        if (!rawKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
        throw new Error(`Variáveis ausentes: ${missing.join(", ")}`);
    }

    if (rawUrl.includes("your-project.supabase.co")) {
        throw new Error(
            `NEXT_PUBLIC_SUPABASE_URL está com o valor de exemplo (${rawUrl}). Atualize na Vercel com a URL real do seu projeto.`,
        );
    }

    const url = rawUrl.replace(/\/+$/, "");
    return { url, key: rawKey };
}

async function supabaseRequest<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const config = requireSupabase();
    const endpoint = `${config.url}/rest/v1/${path}`;

    try {
        const response = await fetch(endpoint, {
            ...init,
            headers: {
                apikey: config.key,
                Authorization: `Bearer ${config.key}`,
                "Content-Type": "application/json",
                ...(init?.headers || {}),
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Supabase ${response.status}: ${errorText}`,
            );
        }

        return response.status === 204 ? (undefined as T) : response.json();
    } catch (err) {
        if (err instanceof Error && err.message.includes("Supabase")) {
            throw err;
        }
        const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
        const causeMsg = cause?.code || cause?.message || "";
        throw new Error(
            `Falha ao conectar em ${config.url} (${causeMsg || "URL inacessível"}). Verifique NEXT_PUBLIC_SUPABASE_URL na Vercel.`,
        );
    }
}

export async function createMessage(input: {
    room: string;
    from: string;
    to: string;
    message: string;
    type: string;
}) {
    const rows = await supabaseRequest<MessageRow[]>("messages", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
            room_code: input.room,
            from_name: input.from,
            to_name: input.to,
            message: input.message,
            type: input.type,
        }),
    });
    return rows[0];
}

export async function listMessages(room: string, recipient: string) {
    const query = new URLSearchParams({
        room_code: `eq.${room}`,
        to_name: `eq.${recipient}`,
        read_at: "is.null",
        order: "created_at.desc",
        limit: "50",
    });
    return supabaseRequest<MessageRow[]>(`messages?${query}`);
}

export async function markMessageRead(room: string, id: string) {
    const query = new URLSearchParams({
        id: `eq.${id}`,
        room_code: `eq.${room}`,
    });
    await supabaseRequest(`messages?${query}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ read_at: new Date().toISOString() }),
    });
}

export function toMessage(row: MessageRow) {
    return {
        id: row.id,
        from: row.from_name,
        to: row.to_name,
        message: row.message,
        type: row.type,
        createdAt: new Date(row.created_at).getTime(),
    };
}

// Count unread messages for a specific room/recipient
export async function countUnread(room: string, recipient: string): Promise<number> {
    const query = new URLSearchParams({
        room_code: `eq.${room}`,
        to_name: `eq.${recipient}`,
        read_at: "is.null",
    });
    const rows = await supabaseRequest<MessageRow[]>(`messages?${query}`);
    return rows.length;
}
