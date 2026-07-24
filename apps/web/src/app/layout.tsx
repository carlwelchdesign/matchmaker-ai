import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@argent/design-system/nocturne.css";
import "./styles.css";

export const metadata: Metadata = {
  title: "Argent Matchmaking",
  description: "A discreet, human-led matchmaking service.",
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
