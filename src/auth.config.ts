import type { NextAuthConfig } from "next-auth";

type Role = "GUEST" | "USER" | "COMMERCIAL" | "ADMIN";

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user?.role as Role) || "GUEST";
      const pathname = nextUrl.pathname;

      // Public routes - accessible to everyone
      if (
        pathname === "/" ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/about") ||
        pathname.startsWith("/contact") ||
        pathname.startsWith("/catalogue") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/products") ||
        pathname.startsWith("/api/categories") ||
        pathname.startsWith("/api/sliders") ||
        pathname.startsWith("/api/contact") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicons") ||
        pathname === "/favicon.ico" ||
        /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(pathname)
      ) {
        return true;
      }

      // Sign-in page: redirect logged-in users to their dashboard
      if (pathname === "/signin") {
        if (isLoggedIn) {
          const dashboardUrl = getDashboardUrl(role);
          return Response.redirect(new URL(dashboardUrl, nextUrl));
        }
        return true;
      }

      // Admin routes
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/signin", nextUrl));
        }
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/403", nextUrl));
        }
        return true;
      }

      // Commercial routes
      if (pathname.startsWith("/commercial") || pathname.startsWith("/api/commercial")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/signin", nextUrl));
        }
        if (role !== "COMMERCIAL" && role !== "ADMIN") {
          return Response.redirect(new URL("/403", nextUrl));
        }
        return true;
      }

      // Account routes (USER, COMMERCIAL, ADMIN)
      if (pathname.startsWith("/account")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/signin", nextUrl));
        }
        return true;
      }

      return true;
    },
    // These callbacks must be here so the proxy (edge) can read role from the JWT
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.companyName = user.companyName;
        token.isActive = user.isActive;
      }
      return token;
    },
    session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.companyName = token.companyName;
      session.user.isActive = token.isActive;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

function getDashboardUrl(role: Role | string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "COMMERCIAL":
      return "/commercial";
    default:
      return "/account";
  }
}
