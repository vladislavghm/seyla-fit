"use client";
import React from "react";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageBlocksAbout } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Section } from "@/components/layout/section";
import { ColorPickerInput } from "@/tina/fields/colorPicker";
import Image from "next/image";
import { motion } from "motion/react";

export const About = ({ data }: { data: PageBlocksAbout }) => {
  const isCenter = (data as { aboutLayout?: string })?.aboutLayout === "center";
  const headerColor = (data as any).headerColor || "#e06b6b";

  return (
    <>
      {/* Заголовок в стиле блока Направления */}
      <div
        id="about"
        className="relative overflow-hidden py-8 px-6 lg:py-12 lg:px-12 w-full scroll-mt-20"
        style={{ backgroundColor: headerColor }}
        data-tina-field={tinaField(data as any, "headerColor" as any)}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <h2
              className="text-6xl lg:text-8xl font-bold whitespace-nowrap"
              style={{ color: `${headerColor}30` }}
            >
              О НАС
            </h2>
          </div>
          <div className="relative z-10 text-center">
            {data.aboutTitle && (
              <motion.h2
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                data-tina-field={tinaField(data, "aboutTitle")}
                className="mb-4 text-4xl lg:text-6xl font-bold text-white"
              >
                {data.aboutTitle}
              </motion.h2>
            )}
            {(data as any).aboutSubtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                data-tina-field={tinaField(data as any, "aboutSubtitle")}
                className="text-lg lg:text-xl text-white/90"
              >
                {(data as any).aboutSubtitle}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      <Section
        backgroundColor={(data as any).backgroundColor}
        className="py-16 lg:py-24"
      >
      <div className="mx-auto max-w-7xl px-6">
        <div
          className={
            isCenter
              ? "flex flex-col gap-12 items-center text-center max-w-3xl mx-auto"
              : "grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16"
          }
        >
          {/* Текстовая часть */}
          <div className={isCenter ? "space-y-6 w-full" : "space-y-6 text-center"}>
            {data.aboutBody && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                data-tina-field={tinaField(data, "aboutBody")}
                className="prose prose-lg max-w-none mx-auto text-center"
              >
                <TinaMarkdown content={data.aboutBody} />
              </motion.div>
            )}
          </div>

          {/* Изображение */}
          {data.aboutImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              data-tina-field={tinaField(data, "aboutImage")}
              className={
                isCenter
                  ? "relative aspect-4/3 overflow-hidden rounded-lg w-full max-w-2xl"
                  : "relative aspect-4/3 overflow-hidden rounded-lg"
              }
            >
              <Image
                src={data.aboutImage}
                alt={data.aboutImageAlt || data.aboutTitle || "О нас"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          )}
        </div>
      </div>
    </Section>
    </>
  );
};

export const aboutBlockSchema: Template = {
  name: "about",
  label: "О нас",
  ui: {
    previewSrc: "/blocks/about.png",
    defaultItem: {
      aboutTitle: "О нас",
      headerColor: "#e06b6b",
      aboutBody:
        "Студия растяжки и фитнеса Шпагат Просто — это место, где можно хорошо и с пользой провести время в кругу единомышленников. Это большое и светлое пространство без изнурительных тренировок. Место, в котором царит дружеская атмосфера и философия «фитнес, через любовь к себе»!\n\n8 направлений позволяют сделать программу тренировок разнообразной, интересной и эффективной.",
    },
  },
  fields: [
    {
      type: "string",
      label: "Расположение блока",
      name: "aboutLayout",
      description: "Центр — текст и изображение по центру в одну колонку",
      ui: {
        component: "select",
      },
      options: [
        { value: "default", label: "Текст слева, изображение справа" },
        { value: "center", label: "Текст по центру (колонка)" },
      ],
    },
    {
      type: "string",
      label: "Цвет фона",
      name: "backgroundColor",
      description: "Цвет фона секции (как в блоке «Бегущая строка»)",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "string",
      label: "Цвет шапки",
      name: "headerColor",
      description: "Цвет фона шапки с заголовком",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "string",
      label: "Заголовок",
      name: "aboutTitle",
    },
    {
      type: "string",
      label: "Подзаголовок",
      name: "aboutSubtitle",
    },
    {
      type: "rich-text",
      label: "Текст",
      name: "aboutBody",
    },
    {
      type: "image",
      label: "Изображение",
      name: "aboutImage",
      description: "Изображение для блока 'О нас'",
      // @ts-ignore
      uploadDir: () => "about",
    },
    {
      type: "string",
      label: "Альтернативный текст изображения",
      name: "aboutImageAlt",
      description: "Текст для доступности (alt)",
    },
  ],
};
