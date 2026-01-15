"use client";
import React from "react";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageBlocksAbout } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Section, sectionBlockSchemaField } from "@/components/layout/section";
import Image from "next/image";

export const About = ({ data }: { data: PageBlocksAbout }) => {
  return (
    <Section background={data.background!} className="py-16 lg:py-24" id="about">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Текстовая часть слева */}
          <div className="space-y-6">
            {data.aboutTitle && (
              <h2
                data-tina-field={tinaField(data, "aboutTitle")}
                className="text-4xl font-bold lg:text-5xl"
              >
                {data.aboutTitle}
              </h2>
            )}
            {data.aboutBody && (
              <div
                data-tina-field={tinaField(data, "aboutBody")}
                className="prose prose-lg max-w-none"
              >
                <TinaMarkdown content={data.aboutBody} />
              </div>
            )}
          </div>

          {/* Изображение справа */}
          {data.aboutImage && (
            <div
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
            </div>
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
      aboutBody: "Студия растяжки и фитнеса Шпагат Просто — это место, где можно хорошо и с пользой провести время в кругу единомышленников. Это большое и светлое пространство без изнурительных тренировок. Место, в котором царит дружеская атмосфера и философия «фитнес, через любовь к себе»!\n\n8 направлений позволяют сделать программу тренировок разнообразной, интересной и эффективной.",
    },
  },
  fields: [
    sectionBlockSchemaField as any,
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
