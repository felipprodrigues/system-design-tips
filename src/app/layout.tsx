import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Public_Sans } from "next/font/google";
import Script from "next/script";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const fontBody = Public_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const fontMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: learn system design one lesson at a time`,
    /* Lesson pages set only their own title; this frames it for search results. */
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A structured, free course on system design fundamentals: scaling, databases, caching, APIs, and the trade-offs behind every distributed system.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME}: learn system design one lesson at a time`,
    description:
      "A structured, free course on system design fundamentals: scaling, databases, caching, APIs, and the trade-offs behind every distributed system.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("sd-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </body>
    </html>
  );
}
