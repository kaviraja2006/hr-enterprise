export class InfrastructureError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;

  constructor(
    code: string,
    message: string,
    retryable = false,
  ) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
