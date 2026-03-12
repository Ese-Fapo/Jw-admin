import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://tech-blog-i77h-5eu5ojvnm-ese-fapohundas-projects.vercel.app"),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        },
    },

    
    callbacks: {
        async onSuccess(context: any) {
            console.log("Auth successful:", context.user);

            const email = context?.user?.email?.toLowerCase?.();
            const userId = context?.user?.id;

            if (email && userId && adminEmails.includes(email)) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { role: "ADMIN" },
                });
            }
        },
        async onError(context: any) {
            console.error("Auth error:", context.error);
        },
    },
});
