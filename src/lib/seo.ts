import type { Metadata } from "next";

export const siteConfig = {
  name: "Nodus Fit",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nodusfit.com",
  description:
    "Plataforma web e PWA para personal trainers gerenciarem alunos, treinos, evolução e financeiro em uma experiência direta.",
  locale: "pt_BR",
  contactEmail: "contato@vortek.dev",
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | "";
};

export function absoluteUrl(path = "") {
  return new URL(path, siteConfig.url).toString();
}

export function createPublicPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: path || "/",
    },
    openGraph: {
      title,
      description,
      url: path || "/",
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
      title,
      description,
      images: [absoluteUrl("/opengraph-image")],
    },
  };
}

export function createJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteConfig.name,
        url: siteConfig.url,
        email: siteConfig.contactEmail,
        description: siteConfig.description,
        logo: absoluteUrl("/favicon.ico"),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: siteConfig.contactEmail,
          availableLanguage: ["pt-BR"],
        },
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "pt-BR",
        publisher: {
          "@id": absoluteUrl("/#organization"),
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": absoluteUrl("/#software"),
        name: siteConfig.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        url: siteConfig.url,
        description: siteConfig.description,
        offers: {
          "@type": "Offer",
          category: "SaaS",
          priceCurrency: "BRL",
          availability: "https://schema.org/PreOrder",
        },
        audience: {
          "@type": "Audience",
          audienceType: "Personal trainers, alunos e academias independentes",
        },
        publisher: {
          "@id": absoluteUrl("/#organization"),
        },
      },
    ],
  };
}

export function serializeJsonLd(data: ReturnType<typeof createJsonLd>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
