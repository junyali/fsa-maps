export type Response = {
    status: string;
};

export async function fetchHealth(): Promise<Response> {
    const res = await fetch("/api/health");

    if (!res.ok) {
        throw new Error("Api unavailable");
    }

    return res.json();
}
