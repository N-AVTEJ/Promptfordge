import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shell/navbar";
import { Footer } from "@/components/shell/footer";
import { ShortcutsModal } from "@/components/shell/shortcuts-modal";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  axes: ["opsz"],
});

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
  themeColor: "#F2F5FF",
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
      className={`${bricolageGrotesque.variable} ${geistSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-daylight font-sans text-navy text-base antialiased selection:bg-ultramarine/20 selection:text-navy">
        <SmoothScrollProvider>
          <div className="relative flex min-h-screen flex-col bg-daylight text-navy">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ShortcutsModal />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
