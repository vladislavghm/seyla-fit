import React from "react";
import { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { VideoDialogProvider } from "@/components/ui/VideoDialogContext";
import VideoDialog from "@/components/ui/VideoDialog";
import client from "@/tina/__generated__/client";

import "@/styles.css";
import { TailwindIndicator } from "@/components/ui/breakpoint-indicator";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const globalData = await client.queries.global({
      relativePath: "index.json",
    });
    const siteTitle = globalData.data.global.title || "Seyla Fit";

    return {
      title: siteTitle,
      description: "Seyla Fit - Студия растяжки и фитнеса",
    };
  } catch (error) {
    return {
      title: "Seyla Fit",
      description: "Seyla Fit - Студия растяжки и фитнеса",
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={cn(montserrat.variable)}>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
      >
        <VideoDialogProvider>
          {children}
          <VideoDialog />
        </VideoDialogProvider>
        <TailwindIndicator />
      </body>
    </html>
  );
}
