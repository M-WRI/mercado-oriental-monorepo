import { describe, it, expect } from "vitest";
import { AppError, ERROR_CODES } from "../../../src/lib/error";

describe("lib / AppError (unit)", () => {
  it("serializes to JSON with case and code", () => {
    const err = new AppError({
      case: "example_case",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
    expect(err.toJSON()).toEqual({
      case: "example_case",
      code: ERROR_CODES.NOT_FOUND,
    });
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("example_case");
  });

  it("defaults status code to 400", () => {
    const err = new AppError({
      case: "bad_request",
      code: ERROR_CODES.MISSING,
    });
    expect(err.statusCode).toBe(400);
  });
});
