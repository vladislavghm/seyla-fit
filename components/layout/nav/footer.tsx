"use client";
import React from "react";
import Link from "next/link";
import { useLayout } from "../layout-context";

export const Footer = () => {
  const { header, footer } = useLayout();

  if (!header || !footer) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backgroundColor = (footer as any)?.backgroundColor || "#1f2937"; // gray-900 по умолчанию

  return (
    <footer className="text-white py-8" style={{ backgroundColor }}>
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Левая часть: Копирайт */}
          <div className="flex flex-col text-sm text-white text-center md:text-left">
            {(footer as any).copyrightLine1 && (
              <span className="text-white">
                {(footer as any).copyrightLine1}
              </span>
            )}
            {(footer as any).copyrightLine2 && (
              <span className="text-white">
                {(footer as any).copyrightLine2}
              </span>
            )}
          </div>

          {/* Центр: Навигация */}
          <nav className="flex items-center gap-6 text-sm">
            {header.nav?.map((item, index) => (
              <Link
                key={index}
                href={item!.href!}
                className="text-white hover:opacity-70 transition-opacity"
              >
                {item!.label}
              </Link>
            ))}
          </nav>

          {/* Правая часть: Наверх */}
          <button
            onClick={scrollToTop}
            className="text-sm text-white hover:opacity-70 transition-opacity"
            aria-label="Наверх"
          >
            Наверх ↑
          </button>
        </div>
      </div>
    </footer>
  );
};
