import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@argent/design-system/nocturne.css";
import "./styles.css";

export const metadata: Metadata = {
  title: "Argent Admin",
  description: "Argent owner operations workspace concept.",
  robots: { index: false, follow: false },
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
