"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLayout } from "../layout-context";

export const Footer = () => {
  const { header, footer } = useLayout();

  if (!header || !footer) return null;

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mt-12 flex flex-wrap items-center gap-6 border-t py-6 flex-col md:flex-row md:justify-between">

          <div className="order-last flex items-center justify-center gap-2 md:order-first md:justify-start">
            {header.logo ? (
              <Link href="/" aria-label="go home">
                <Image
                  src={header.logo}
                  alt={header.name || "Logo"}
                  width={100}
                  height={30}
                  className="h-auto w-auto object-contain"
                />
              </Link>
            ) : header.name ? (
              <Link href="/" aria-label="go home" className="text-muted-foreground hover:text-foreground">
                {header.name}
              </Link>
            ) : null}
            {header.name && (
              <span className="self-center text-muted-foreground text-sm">
                © {new Date().getFullYear()}, All rights reserved
              </span>
            )}
          </div>

          <div className="order-first flex justify-center gap-6 text-sm md:order-last md:justify-end">
            {footer.social?.map((link, index) => (
              <Link
                key={`${link!.icon}${index}`}
                href={link!.url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon
                  data={{ ...link!.icon, size: "small" }}
                  className="text-muted-foreground hover:text-primary block"
                />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
