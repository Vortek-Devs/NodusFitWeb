import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { withoutBridgeJwt } from "@/lib/auth/public-auth-response";

const authHandlers = toNextJsHandler(auth);

export const GET = withoutBridgeJwt(authHandlers.GET);
export const POST = withoutBridgeJwt(authHandlers.POST);
