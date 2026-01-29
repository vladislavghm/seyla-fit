"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "../../icon";
import { useLayout } from "../layout-context";
import { Menu, X } from "lucide-react";
import { normalizeIconData } from "@/lib/icon-utils";

export const Header = () => {
  const { header, theme } = useLayout();

  if (!header) return null;

  const { showComingSoonStub } = useLayout();
  const [menuState, setMenuState] = React.useState(false);
  const backgroundColor = header.backgroundColor || "#ebebeb";
  const logoHref = showComingSoonStub ? "/home" : "/";

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full"
        style={{ backgroundColor }}
      >
        <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 transition-all duration-300">
          <div className="relative flex items-center justify-between gap-6 py-4">
            {/* Logo */}
            <div className="shrink-0">
              <Link
                href={logoHref}
                aria-label="Главная"
                className="flex flex-col"
              >
                {header.logo && (
                  <Image
                    src={header.logo}
                    alt="Logo"
                    width={100}
                    height={40}
                    className="h-auto max-h-[40px] w-auto object-contain"
                  />
                )}
              </Link>
            </div>

            {/* Desktop Navigation - центрированная */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
              <ul
                className="flex items-center gap-8"
                style={{ fontSize: "16px" }}
              >
                {header.nav!.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item!.href!}
                      className="text-foreground hover:opacity-70 block duration-150 font-semibold"
                      style={{ fontWeight: 600 }}
                    >
                      <span>{item!.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side: Social links and Phone */}
            <div className="flex items-center gap-4 min-w-[343px] justify-end">
              {/* Social Links */}
              {header.social && header.social.length > 0 && (
                <div className="flex items-center gap-3">
                  {header.social.map((social, index) => {
                    const iconData = normalizeIconData(social?.icon, "small");
                    if (!iconData || !social?.url) return null;
                    return (
                      <Link
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:opacity-70 transition-opacity"
                        aria-label={iconData.name || "Social link"}
                      >
                        <Icon data={iconData} className="w-[30px] h-[30px]" />
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Phone */}
              {header.phone && (
                <Link
                  href={`tel:${header.phone.replace(/\s/g, "")}`}
                  className="text-foreground hover:opacity-70 transition-opacity text-sm"
                >
                  {header.phone}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
          <div
            className="in-data-[state=active]:block lg:hidden mb-6 hidden w-full rounded-3xl border border-border/50 p-6 shadow-lg"
            style={{ backgroundColor }}
          >
            <ul className="space-y-6 text-base">
              {header.nav?.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item!.href!}
                    className="text-foreground hover:opacity-70 block duration-150"
                    onClick={() => setMenuState(false)}
                  >
                    <span>{item!.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};
