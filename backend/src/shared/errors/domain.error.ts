export interface DomainErrorOptions {
  metadata?: Record<string, unknown>;
}

export class DomainError extends Error {
  public readonly code: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    options?: DomainErrorOptions,
  ) {
    super(message);
    this.code = code;
    this.metadata = options?.metadata;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
