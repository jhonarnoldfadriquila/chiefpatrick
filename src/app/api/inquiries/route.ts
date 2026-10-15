import { clientIp, rateLimit } from "@/lib/server/auth";
import { ApiError, ok, readJson, route } from "@/lib/server/http";
import { createInquiry } from "@/lib/server/repos/bookings";
import { parse, v } from "@/lib/server/validate";

/** Public "ask a question" form on /contact. Saved as an inquiry with status "new". */
export const POST = route(async ({ req }) => {
  if (!rateLimit(`inquiry:${await clientIp()}`, 10, 60 * 60_000)) {
    throw new ApiError(429, "Too many messages from this connection. Please call us instead.");
  }
  const body = await readJson(req);
  // Honeypot: real visitors never fill the hidden "website" field.
  if (body.website) return ok({ received: true });
  const data = parse(body, {
    name: v.string({ min: 2, max: 100 }),
    email: v.email(),
    phone: v.string({ max: 40, optional: true }),
    subject: v.string({ min: 2, max: 120 }),
    message: v.string({ min: 10, max: 2000 }),
  });
  await createInquiry(data);
  return ok({ received: true }, undefined, 201);
});
