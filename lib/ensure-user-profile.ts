import { prisma } from "@/lib/prisma"

/** Idempotent: ensures `users` row exists (sign-in, OAuth, and email-confirm callback). */
export async function ensureUserProfile(id: string, email: string | null): Promise<void> {
  await prisma.user.upsert({
    where: { id },
    create: { id, email },
    update: { email: email ?? undefined },
  })
}
