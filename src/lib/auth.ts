import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Sifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check against environment variables for simple admin auth
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          credentials.email === adminEmail &&
          credentials.password === adminPassword
        ) {
          return {
            id: "admin",
            email: adminEmail,
            name: "Admin",
          };
        }

        // Optionally verify against HiveAuth API
        try {
          const response = await fetch(
            `${process.env.HIVEAUTH_API_URL}/api/v1/admin/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-app-secret": process.env.HIVEAUTH_APP_SECRET || "",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.valid && data.user) {
              return {
                id: data.user.id || "admin",
                email: data.user.email,
                name: data.user.name || "Admin",
              };
            }
          }
        } catch (error) {
          console.error("HiveAuth admin verify error:", error);
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
