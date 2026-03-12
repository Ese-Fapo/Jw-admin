import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/general/navbar/Navbar";
import Footer from "./components/general/Footer";
import SignInModal from "./components/modals/SignInModal";
import { Toaster } from "react-hot-toast";
import QueryProvider from "./providers/QueryProvider";

const poppings = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight:["300","400","500","600","700","800","900"]
});


export const metadata: Metadata = {
  title: "Tech Blog",
  description: "Clean blog frontend powered by your existing API, auth, and database backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${poppings.className} antialiased min-h-screen bg-slate-950 text-slate-100`}
      >
        <QueryProvider>
          <Navbar />
          <main>{children}</main>
          <SignInModal />
          <Footer />
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
