import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@argent/design-system/nocturne.css";
import "./styles.css";
import "./landing-sunrise.css";

export const metadata: Metadata = {
  title: "The Montecito Matchmaker | A Division of Argent",
  description:
    "A discreet, human-led matchmaking service in Montecito, California.",
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
