import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { protectPublicAuthResponse } from "@/lib/auth/public-auth-response";

const authHandlers = toNextJsHandler(auth);

export const GET = protectPublicAuthResponse(authHandlers.GET);
export const POST = protectPublicAuthResponse(authHandlers.POST);
