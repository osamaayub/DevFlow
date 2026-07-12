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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isNamedError = (value: unknown): value is { name: string; message?: string } =>
    isObject(value) && typeof (value as { name: unknown }).name === "string";

const isAbortError = (value: unknown): value is { name: "AbortError" } =>
    isNamedError(value) && value.name === "AbortError";

export async function fetchHandler<T = unknown>(url: string, options: FetchOptions = {}): Promise<ActionResponse<T>> {
    const {
        json,
        headers,
        timeoutMs = 15000,
        retries = 0,
        retryDelayMs = 300,
        throwOnErrorBody = false,
        ...rest
    } = options;

    const makeRequest = async (attempt = 0): Promise<ActionResponse<T>> => {
        const controller = new AbortController();
        const id = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : undefined;

        try {
            const reqHeaders = new Headers(headers as HeadersInit | undefined);

            let body: BodyInit | null = null;
            if (json !== undefined) {
                if (!reqHeaders.has("Content-Type")) reqHeaders.set("Content-Type", "application/json");
                body = JSON.stringify(json);
            } else if ("body" in rest && rest.body !== undefined) {
                body = rest.body as BodyInit;
            }

            const response = await fetch(url, {
                ...rest,
                headers: reqHeaders,
                body,
                signal: controller.signal,
            });

            const contentType = response.headers.get("content-type") ?? "";

            if (response.status === 204) {
                return { success: true, data: undefined as unknown as T, statusCode: 204 } as ActionResponse<T>;
            }

            let payload: unknown = null;
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

            const payloadRecord = isObject(payload) ? payload : undefined;
            const payloadMessage = payloadRecord && "message" in payloadRecord ? String(payloadRecord.message) : undefined;
            const payloadError = payloadRecord && "error" in payloadRecord ? payloadRecord.error : undefined;

            if (!response.ok) {
                const message = payloadMessage || `HTTP error! status: ${response.status}`;
                throw new FetchError(message, response.status, payloadError ?? payload, payload);
            }

            if (
                throwOnErrorBody &&
                payloadRecord &&
                "success" in payloadRecord &&
                payloadRecord.success === false
            ) {
                const message = payloadMessage ?? "Server reported error";
                const statusCode =
                    payloadRecord.statusCode && typeof payloadRecord.statusCode === "number"
                        ? payloadRecord.statusCode
                        : undefined;
                throw new FetchError(message, statusCode, payloadError, payload);
            }

            return payload as ActionResponse<T>;
        } catch (err: unknown) {
            const abort = isAbortError(err);
            const network = abort || (isNamedError(err) && typeof err.message === "string" && err.message.includes("Failed to fetch"));

            const canRetry = attempt < retries && (network || (err instanceof FetchError && (err.statusCode ?? 0) >= 500));
            if (canRetry) {
                const delay = Math.round(retryDelayMs * Math.pow(2, attempt)) + Math.floor(Math.random() * 100);
                await sleep(delay);
                return makeRequest(attempt + 1);
            }

            if (err instanceof FetchError) throw err;
            if (abort) throw new FetchError("Request timed out", 408);

            const message = isNamedError(err) && typeof err.message === "string" ? err.message : String(err);
            throw new FetchError(message);
        } finally {
            if (id !== undefined) {
                clearTimeout(id);
            }
        }
    };

    return makeRequest();
}