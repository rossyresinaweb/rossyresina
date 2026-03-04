import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser, ensureAdminFromEnv, isAdminEmail } from "@/lib/users";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await ensureAdminFromEnv();
        const allowed = (process.env.ADMIN_EMAILS || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        const email = String(credentials?.email || "").trim().toLowerCase();
        const pass = String(credentials?.password || "");
        const okPass = !!process.env.ADMIN_PASSWORD && pass === process.env.ADMIN_PASSWORD;
        if (okPass && (allowed.length === 0 || allowed.includes(email))) {
          return { id: email, email, role: "ADMIN" } as any;
        }
        const user = await verifyUser(email, pass);
        if (user) {
          return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
        }
        return null;
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && (user as any).role) {
        token.role = (user as any).role;
      }
      if (!token.role && isAdminEmail(String(token.email || ""))) {
        token.role = "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const roleFromToken = (token as any).role;
        (session.user as any).role = roleFromToken || (isAdminEmail(session.user.email || "") ? "ADMIN" : "CUSTOMER");
        if (!session.user.name && (token as any).name) {
          session.user.name = String((token as any).name);
        }
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
