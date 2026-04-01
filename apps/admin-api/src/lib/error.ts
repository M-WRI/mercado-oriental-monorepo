export const ERROR_CODES = {
  MISSING: "MISSING",
  INVALID: "INVALID",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE: "DUPLICATE",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  IN_USE: "IN_USE",
  SERVER_ERROR: "SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  public readonly case: string;
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly payload?: any;

  constructor({
    case: errorCase,
    code,
    statusCode = 400,
    payload,
  }: {
    case: string;
    code: ErrorCode;
    statusCode?: number;
    payload?: any;
  }) {
    super(errorCase);
    this.case = errorCase;
    this.code = code;
    this.statusCode = statusCode;
    this.payload = payload;
  }

  toJSON() {
    return {
      case: this.case,
      code: this.code,
      payload: this.payload,
    };
  }
}
