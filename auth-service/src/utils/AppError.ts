export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain

    this.statusCode = statusCode;
    this.isOperational = true; // Flags this as a known, handled error

    // Capture the stack trace but exclude the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}