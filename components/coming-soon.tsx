"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";

const COMING_SOON_BG = "#160D80";
const TELEGRAM_URL = "https://t.me/seylafit";
// Логотип Telegram в центре QR: можно заменить на /telegram-logo.png из public
const TELEGRAM_LOGO_SRC = "https://telegram.org/img/t_logo.png";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export function ComingSoon() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 text-white"
      style={{ backgroundColor: COMING_SOON_BG }}
    >
      {/* Лёгкий градиент для глубины */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,138,115,0.15), transparent)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-10 text-center">
        {/* Логотип Seyla */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0 }}>
          <Image
            src="/uploads/header/Logotype_Seyla_Long.svg"
            alt="Seyla"
            width={180}
            height={48}
            className="h-auto w-[180px] object-contain"
            priority
          />
        </motion.div>

        {/* Основной текст */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
        >
          <h1 className="font-semibold uppercase tracking-[0.2em] text-white text-4xl leading-tight sm:text-5xl md:text-6xl">
            Скоро открытие
          </h1>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.28 }}
        >
          <p className="text-xl uppercase tracking-[0.15em] text-white/90 sm:text-2xl">
            Фитнес студии
          </p>
        </motion.div>

        {/* QR-код: ссылка на Telegram */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.4 }}
          className="mt-4"
        >
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-white p-2"
            aria-label="Перейти в Telegram — Seyla Fit"
          >
            <QRCodeSVG
              value={TELEGRAM_URL}
              size={160}
              level="H"
              bgColor="#ffffff"
              fgColor="#160D80"
              imageSettings={{
                src: TELEGRAM_LOGO_SRC,
                height: 40,
                width: 40,
                excavate: true,
              }}
              title="Telegram — Seyla Fit"
            />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
