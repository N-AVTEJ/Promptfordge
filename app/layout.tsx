import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shell/navbar";
import { Footer } from "@/components/shell/footer";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PromptForge | Interactive Prompt Engineering Academy",
  description:
    "An interactive prompt engineering academy where learners experiment with prompts in live labs with embedded YouTube lessons.",
  keywords: [
    "prompt engineering",
    "LLM",
    "AI academy",
    "prompt playground",
    "eval engine",
    "Gemini",
    "OpenAI",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0B0C0E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-forge-black font-sans text-forge-text antialiased selection:bg-ember-500/30 selection:text-white">
        <SmoothScrollProvider>
          <div className="relative flex min-h-screen flex-col bg-forge-black">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
