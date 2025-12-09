"use client";
import Header from "@/components/layout/Header/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.scss";
import FAQ from "@/components/layout/FAQ/FAQ";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        <Header />
        <main className="container">{children}</main>
        <FAQ />
        <ToastContainer />
      </body>
    </html>
  );
}
