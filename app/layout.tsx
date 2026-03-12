import type { Metadata } from "next";
import {  Poppins } from "next/font/google";
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
  title: "Bem Site Developer",
  description: "Bem Site Developer - web development, technology insights, and modern digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${poppings.className} antialiased bg-black min-h-screen`}
      >
        <QueryProvider>
          <Navbar/>
          {children}
          <SignInModal/>
          <Footer/>
          <Toaster/>
        </QueryProvider>
      </body>
    </html>
  );
}
