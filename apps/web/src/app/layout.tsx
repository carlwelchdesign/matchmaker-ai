import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@argent/design-system/nocturne.css";
import "./styles.css";
import "./landing-sunrise.css";

const siteTitle = "The Montecito Matchmaker";
const siteDescription = "A division of Argent";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: siteTitle,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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
