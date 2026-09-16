type InitialInputResult =
  | {
      valid: true;
      value: string;
    }
  | {
      valid: false;
      code: "REQUIRED" | "INVALID_TYPE";
    };

export function checkStringInput(input: unknown): InitialInputResult {
  if (input === undefined || input === null || input === "") {
    return { valid: false, code: "REQUIRED" };
  }

  if (typeof input !== "string") {
    return { valid: false, code: "INVALID_TYPE" };
  }

  return { valid: true, value: input };
}
