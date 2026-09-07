export type Session = {
    name: string;
    otherName: string;
    room: string;
    gender: "ele" | "ela";
};

const SESSION_KEY = "safadas.session";

export function saveSession(session: Session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readSession(): Session | null {
    try {
        const value = window.localStorage.getItem(SESSION_KEY);
        return value ? (JSON.parse(value) as Session) : null;
    } catch {
        return null;
    }
}

export function clearSession() {
    window.localStorage.removeItem(SESSION_KEY);
}

export function makeOneSignalId(room: string, name: string) {
    return `${room.trim().toLowerCase()}:${name.trim().toLowerCase()}`;
}
