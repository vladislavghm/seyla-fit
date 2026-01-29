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
  return (
    <Section
      backgroundColor={(data as any).backgroundColor}
      className="py-16 lg:py-24"
      id="about"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Текстовая часть слева */}
          <div className="space-y-6">
            {data.aboutTitle && (
              <motion.h2
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                data-tina-field={tinaField(data, "aboutTitle")}
                className="text-4xl font-bold lg:text-5xl"
              >
                {data.aboutTitle}
              </motion.h2>
            )}
            {data.aboutBody && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                data-tina-field={tinaField(data, "aboutBody")}
                className="prose prose-lg max-w-none"
              >
                <TinaMarkdown content={data.aboutBody} />
              </motion.div>
            )}
          </div>

          {/* Изображение справа */}
          {data.aboutImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              data-tina-field={tinaField(data, "aboutImage")}
              className="relative aspect-4/3 overflow-hidden rounded-lg"
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
  );
};

export const aboutBlockSchema: Template = {
  name: "about",
  label: "О нас",
  ui: {
    previewSrc: "/blocks/about.png",
    defaultItem: {
      aboutTitle: "О нас",
      aboutBody:
        "Студия растяжки и фитнеса Шпагат Просто — это место, где можно хорошо и с пользой провести время в кругу единомышленников. Это большое и светлое пространство без изнурительных тренировок. Место, в котором царит дружеская атмосфера и философия «фитнес, через любовь к себе»!\n\n8 направлений позволяют сделать программу тренировок разнообразной, интересной и эффективной.",
    },
  },
  fields: [
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
      label: "Заголовок",
      name: "aboutTitle",
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
