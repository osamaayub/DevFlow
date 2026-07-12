export type FetchOptions = RequestInit & {
    json?: unknown;
    timeoutMs?: number; // per-request timeout
    retries?: number; // number of retries on network failure / 5xx
    retryDelayMs?: number; // initial retry delay
    throwOnErrorBody?: boolean; // if true, throw when server returns success=false in body
};

export class FetchError extends Error {
    statusCode?: number;
    details?: unknown;
    body?: unknown;

    constructor(message: string, statusCode?: number, details?: unknown, body?: unknown) {
        super(message);
        this.name = "FetchError";
        this.statusCode = statusCode;
        this.details = details;
        this.body = body;
    }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchHandler<T = unknown>(url: string, options: FetchOptions = {}): Promise<ActionResponse<T>> {
    const { json, headers, timeoutMs = 15000, retries = 0, retryDelayMs = 300, throwOnErrorBody = false, ...rest } = options;

    const makeRequest = async (attempt = 0): Promise<ActionResponse<T>> => {
        const controller = new AbortController();
        const id = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : undefined;

        try {
            const reqHeaders = new Headers(headers as HeadersInit | undefined);

            let body: BodyInit | null = null;
            if (json !== undefined) {
                if (!reqHeaders.has("Content-Type")) reqHeaders.set("Content-Type", "application/json");
                body = JSON.stringify(json);
            } else if ((rest as any).body) {
                body = (rest as any).body as BodyInit;
            }

            const response = await fetch(url, { ...rest, headers: reqHeaders, body, signal: controller.signal as any });

            const contentType = response.headers.get("content-type") || "";

            // handle no-content
            if (response.status === 204) {
                return { success: true, data: null as any, statusCode: 204 } as ActionResponse<T>;
            }

            let payload: any = null;
            if (contentType.includes("application/json")) {
                payload = await response.json();
            } else {
                const text = await response.text();
                try {
                    payload = JSON.parse(text);
                } catch {
                    payload = text;
                }
            }

            if (!response.ok) {
                const message = payload?.message || `HTTP error! status: ${response.status}`;
                throw new FetchError(message, response.status, payload?.error ?? payload, payload);
            }

            // optional: server returns an application-level error shape { success: false }
            if (throwOnErrorBody && payload && typeof payload === "object" && payload.success === false) {
                const message = payload.message || "Server reported error";
                throw new FetchError(message, (payload.statusCode as number) ?? undefined, payload.error ?? undefined, payload);
            }

            return payload as ActionResponse<T>;
        } catch (err: unknown) {
            const isAbort = (err as any)?.name === "AbortError";
            const isNetwork = (err as any)?.message?.includes("Failed to fetch") || isAbort;

            // retry on network errors or Abort (transient) or server 5xx wrapped in FetchError
            const canRetry = attempt < retries && (isNetwork || (err instanceof FetchError && (err.statusCode ?? 0) >= 500));
            if (canRetry) {
                const delay = Math.round(retryDelayMs * Math.pow(2, attempt)) + Math.floor(Math.random() * 100);
                await sleep(delay);
                return makeRequest(attempt + 1);
            }

            if (err instanceof FetchError) throw err;

            // wrap other errors
            if ((err as any)?.name === "AbortError") {
                throw new FetchError("Request timed out", 408);
            }

            throw new FetchError((err as Error)?.message || String(err));
        } finally {
            if (id !== undefined) {
                clearTimeout(id);
            }
        }
    };

    return makeRequest();
}