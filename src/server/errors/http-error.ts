export class RequestError extends Error {
  statusCode: number;
  error?: Record<string, string[]>;

  constructor(message?: string, statusCode = 500, error?: Record<string, string[]>) {
    super(message ?? "Something went wrong");
    this.name = "RequestError";
    this.statusCode = statusCode;
    this.error = error;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  protected static formatMessages(error?: Record<string, string[]>): string {
    if (!error) return "";

    return Object.entries(error)
      .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
      .join("; ");
  }
}

export class ValidationError extends RequestError {
  constructor(error?: Record<string, string[]>) {
    const details = RequestError.formatMessages(error);
    super(details ? `Validation Error: ${details}` : "Validation Error", 400, error);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends RequestError {
  constructor(error?: Record<string, string[]>) {
    const details = RequestError.formatMessages(error);
    super(details ? `Not Found: ${details}` : "Not Found", 404, error);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends RequestError {
  constructor(error?: Record<string, string[]>) {
    const details = RequestError.formatMessages(error);
    super(details ? `Forbidden: ${details}` : "Forbidden", 403, error);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message?: string) {
    super(message ?? "Unauthorized", 401);
    this.name = "UnauthorizedError";
  }
}

export { UnauthorizedError as unAuthorizedError };
