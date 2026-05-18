import type { Metadata, Viewport } from "next";
import { Geist_Mono, Syne } from "next/font/google";
import { absoluteUrl, createJsonLd, serializeJsonLd, siteConfig } from "@/lib/seo";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jsonLd = serializeJsonLd(createJsonLd());

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Nodus Fit | Plataforma para personal trainers",
    template: "%s | Nodus Fit",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Nodus Fit",
    "personal trainer",
    "gestão de alunos",
    "treinos online",
    "PWA para personal",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: "Nodus Fit | Plataforma para personal trainers",
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Nodus Fit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nodus Fit | Plataforma para personal trainers",
    description: siteConfig.description,
    images: [absoluteUrl("/opengraph-image")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F0D",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <script type="application/ld+json">{jsonLd}</script>
        {children}
      </body>
    </html>
  );
}
