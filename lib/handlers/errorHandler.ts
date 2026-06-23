import { NextResponse } from "next/server";
import { ZodError } from "zod";

import logger from "@/lib/logger";
import { RequestError } from "@/lib/http-error";

export type ResponseType = "api" | "server";

const DEFAULT_RESPONSE_TYPE: ResponseType = "server";

export const formatErrorMessage = (error?: Record<string, string[]>): string | undefined => {
  if (!error) return undefined;

  return Object.entries(error)
    .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(", ")}`)
    .join("; ");
};

const normalizeZodError = (error: ZodError): RequestError => {
  const fieldErrors = error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const field = issue.path.length ? issue.path.join(".") : "root";
    acc[field] = [...(acc[field] ?? []), issue.message];
    return acc;
  }, {});

  return new RequestError("Validation Error", 400, fieldErrors);
};

export const HandleError = (
  error: RequestError | ZodError | string,
  responseType: ResponseType = DEFAULT_RESPONSE_TYPE,
  statusCode?: number,
  message?: string,
) => {
  const requestError =
    error instanceof ZodError
      ? normalizeZodError(error)
      : error instanceof RequestError
        ? error
        : new RequestError(message || String(error), statusCode ?? 500);

  const finalStatusCode = requestError.statusCode ?? statusCode ?? 500;
  const finalMessage = requestError.message || message || "Something went wrong";
  const normalizedError =
    responseType === "server" ? formatErrorMessage(requestError.error) : requestError.error;

  logger.error(
    {
      err: requestError,
      responseType,
      statusCode: finalStatusCode,
      message: finalMessage,
      error: normalizedError,
    },
    "HandleError encountered an error",
  );

  return NextResponse.json(
    {
      success: false,
      statusCode: finalStatusCode,
      message: finalMessage,
      ...(normalizedError !== undefined ? { error: normalizedError } : {}),
    },
    { status: finalStatusCode },
  );
};

export const formatResponse = HandleError;


