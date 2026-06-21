import { AppError } from "@/utils/AppError";

/**
 * Placeholder test verifying the test pipeline itself (Jest + ts-jest +
 * path aliases) works end-to-end. No business-feature tests yet — this
 * file should be the first one deleted once real module tests exist.
 */
describe("project setup smoke test", () => {
  it("constructs an AppError with the expected shape", () => {
    const err = new AppError(404, "NOT_FOUND", "Resource not found");

    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Resource not found");
    expect(err.isOperational).toBe(true);
  });
});
