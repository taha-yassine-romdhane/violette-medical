"use server";

import { signIn } from "@/auth";
import { checkRateLimit } from "@/lib/auth-utils";
import { AuthError } from "next-auth";

export async function signInAction(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Veuillez remplir tous les champs." };
  }

  // Rate limiting
  const rateCheck = checkRateLimit(email.toLowerCase());
  if (!rateCheck.allowed) {
    const minutesLeft = Math.ceil((rateCheck.resetAt - Date.now()) / 60000);
    return {
      error: `Trop de tentatives. Réessayez dans ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
    };
  }

  try {
    // In next-auth v5 server actions, signIn throws a NEXT_REDIRECT on success.
    // We must re-throw that redirect (it's not an AuthError).
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou mot de passe invalide." };
    }
    // Re-throw the redirect — this is how next-auth v5 works in server actions
    throw error;
  }

  return { error: "" };
}
