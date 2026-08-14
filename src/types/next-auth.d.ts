import { Role } from "@/generated/prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    companyName?: string | null;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      companyName?: string | null;
      isActive: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    companyName?: string | null;
    isActive: boolean;
  }
}
