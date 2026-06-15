export class RequestError extends Error {
	statusCode?: number
    error?: Record<string, string[]>

	constructor(message?: string, statusCode?: number, error?: Record<string, string[]>) {
		super(message)
		this.name = 'RequestError'
		this.statusCode = statusCode
		this.error = error
		Object.setPrototypeOf(this, RequestError.prototype)
	}
}
export class ValidationError extends RequestError {
    constructor(error?: Record<string, string[]>) {
        const msg = ValidationError.formatMessage(error)
        super(msg, 400, error)
        this.name = 'ValidationError'
        Object.setPrototypeOf(this, ValidationError.prototype)
    }
    private static formatMessage(error?: Record<string, string[]>): string {
        if (!error) return 'Validation Error'
        const messages = Object.entries(error).map(([field, errors]) => {
            const fieldErrors = errors.join(', ')
            return `${field}: ${fieldErrors}`
        })
        return `Validation Error: ${messages.join('; ')}`
    }
}
export class NotFoundError extends RequestError {
    constructor(error?: Record<string, string[]>) {
        const msg = NotFoundError.formatMessage(error)
        super(msg, 404, error)
        this.name = 'NotFoundError'
        Object.setPrototypeOf(this, NotFoundError.prototype)
    }
    private static formatMessage(error?: Record<string, string[]>): string {
        if (!error) return 'Not Found'
        const messages = Object.entries(error).map(([field, errors]) => {
            const fieldErrors = errors.join(', ')
            return `${field}: ${fieldErrors}`
        })
        return `Not Found: ${messages.join('; ')}`
    }
}
export class ForbiddenError extends RequestError {
    constructor(error?: Record<string, string[]>) {
        const msg = ForbiddenError.formatMessage(error)
        super(msg, 403, error)
        this.name = 'ForbiddenError'
        Object.setPrototypeOf(this, ForbiddenError.prototype)
    }
    private static formatMessage(error?: Record<string, string[]>): string {
        if (!error) return 'Forbidden'
        const messages = Object.entries(error).map(([field, errors]) => {
            const fieldErrors = errors.join(', ')
            return `${field}: ${fieldErrors}`
        })
        return `Forbidden: ${messages.join('; ')}`
    }
}   
export class unAuthorizedError extends RequestError {
    constructor(message?: string) {
        super(message || 'Unauthorized', 401)
        this.name = 'unAuthorizedError'
        Object.setPrototypeOf(this, unAuthorizedError.prototype)
    }
}