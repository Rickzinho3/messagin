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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireSupabase() {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase não está configurado na Vercel");
    }
    return { url: supabaseUrl, key: supabaseKey };
}

async function supabaseRequest<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const config = requireSupabase();
    const response = await fetch(`${config.url}/rest/v1/${path}`, {
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
        throw new Error(
            `Supabase ${response.status}: ${await response.text()}`,
        );
    }

    return response.status === 204 ? (undefined as T) : response.json();
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
