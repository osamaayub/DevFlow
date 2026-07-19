import { fetchHandler, FetchOptions } from "./fetch";

export type UserSignUpPayload = {
    name: string;
    username: string;
    email: string;
    password: string;
};

export type AccountCreatePayload = {
    email: string;
    provider: string;
    providerAccountId: string;
    userId: string;
    name?: string;
    password?: string;
    image?: string;
};

export type OauthSignInPayload = {
    provider: string;
    providerAccountId: string;
    user: {
        name: string;
        username: string;
        email: string;
        image?: string;
    };
    image?: string;
};

export type UserDto = {
    _id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    image?: string;
    location?: string;
    portfolio?: string;
    reputation?: number;
    joinedAt: string;
};

export type AccountDto = {
    _id: string;
    email: string;
    provider: string;
    providerAccountId: string;
    userId: string;
    name?: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
};

const API_BASE_URL = (() => {
    if (typeof window !== "undefined") {
        return "";
    }

    const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
        "http://127.0.0.1:3000";

    return baseUrl;
})();

const defaultOptions: FetchOptions = {
    timeoutMs: 15000,
    retryDelayMs: 300,
    throwOnErrorBody: true,
    credentials: "same-origin",
    headers: {
        Accept: "application/json",
    },
};

const baseOptions = (options: FetchOptions = {}): FetchOptions => {
    const method = options.method ? String(options.method).toUpperCase() : "GET";
    const retries = options.retries ?? (method === "GET" || method === "HEAD" ? 1 : 0);

    return {
        ...defaultOptions,
        ...options,
        retries,
        headers: {
            ...(defaultOptions.headers as Record<string, string>),
            ...(options.headers as Record<string, string> | undefined),
        },
    };
};

const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;

const apiRequest = async <T>(path: string, options: FetchOptions = {}) => {
    const response = await fetchHandler<T>(getApiUrl(path), baseOptions(options));
    return response.data;
};

export const usersApi = {
    getAll: () => apiRequest<UserDto[]>("/api/users"),
    getById: (id: string) => apiRequest<UserDto>(`/api/users/${id}`),
    getByEmail: (email: string) => apiRequest<UserDto[]>("/api/users/email", { method: "POST", json: { email } }),
    create: (payload: UserSignUpPayload) => apiRequest<UserDto>("/api/users", { method: "POST", json: payload }),
    update: (id: string, payload: Partial<UserSignUpPayload>) => apiRequest<UserDto>(`/api/users/${id}`, { method: "PUT", json: payload }),
    delete: (id: string) => apiRequest<void>(`/api/users/${id}`, { method: "DELETE" }),
};

export const accountsApi = {
    getAll: () => apiRequest<AccountDto[]>("/api/accounts"),
    getById: (id: string) => apiRequest<AccountDto>(`/api/accounts/${id}`),
    getByProviderAccountId: (providerAccountId: string) => apiRequest<AccountDto>("/api/accounts/provider", {
        method: "POST",
        json: { providerAccountId },
    }),
    create: (payload: AccountCreatePayload) => apiRequest<AccountDto>("/api/accounts", { method: "POST", json: payload }),
    update: (id: string, payload: Partial<AccountCreatePayload>) => apiRequest<AccountDto>(`/api/accounts/${id}`, { method: "PUT", json: payload }),
    delete: (id: string) => apiRequest<void>(`/api/accounts/${id}`, { method: "DELETE" }),
};

export const authApi = {
    signInOauth: (payload: OauthSignInPayload) => apiRequest<UserDto>("/api/auth/signInOauth", {
        method: "POST",
        json: payload,
    }),
};
