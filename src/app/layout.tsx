import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display-face",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
});

export const metadata: Metadata = {
  title: {
    default: "Evidence Reps — Every rep backed by evidence",
    template: "%s | Evidence Reps",
  },
  description:
    "Acessórios de treino baseados em evidências: caneleiras, anilhas de microloading, bands, straps e mais.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://evidence-reps-lojha.vercel.app"),
  openGraph: {
    title: "Evidence Reps",
    description: "Every rep backed by evidence.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
