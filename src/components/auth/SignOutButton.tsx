"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ||
        "text-gray-700 hover:text-purple-700 font-medium transition-colors"
      }
    >
      Déconnexion
    </button>
  );
}
