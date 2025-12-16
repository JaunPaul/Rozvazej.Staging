import type { ZodSafeParseResult } from "zod";
import { VERIFY_ENDPOINT } from "../endpoints";
import { verifyResponseSchema, type VerifyResponse } from "../schema";

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function verifyUser(
  userId: string
): Promise<ZodSafeParseResult<VerifyResponse>> {
  const endpoint = VERIFY_ENDPOINT;

  try {
    const fd = new FormData();
    fd.append("courierId", userId);

    const response = await fetch(endpoint, {
      method: "POST",
      body: fd,
    });

    const result = await response.json();
    const parsedResult = verifyResponseSchema.safeParse(result);

    return parsedResult;
  } catch (error) {
    throw new Error("Check failed");
  }
}
