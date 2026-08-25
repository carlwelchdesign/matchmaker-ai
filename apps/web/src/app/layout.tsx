import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@argent/design-system/nocturne.css";
import "./styles.css";
import "./landing-sunrise.css";

const siteTitle = "The Montecito Matchmaker";
const siteDescription = "A division of Argent";
const socialImage = {
  url: "/images/argent-sunrise-couple-hero-selected.jpg",
  width: 1280,
  height: 853,
  alt: "A couple sharing an intimate moment on a terrace overlooking the Pacific at sunrise",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://montecito-matchmaker.vercel.app"),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteTitle,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
    siteName: siteTitle,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
