"use client";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import type { Template } from "tinacms";
import { tinaField } from "tinacms/dist/react";
import { PageBlocksHero } from "@/tina/__generated__/types";
import { Button } from "@/components/ui/button";
import { ColorPickerInput } from "@/tina/fields/colorPicker";
export const Hero = ({ data }: { data: PageBlocksHero }) => {
  const heroData = data as any;

  // Получаем фон: изображение или цвет
  const backgroundImage = heroData?.backgroundImage;
  const backgroundColor = heroData?.backgroundColor || "#ffffff";

  // Определяем, нужен ли темный текст (для светлого фона)
  const isLightBackground =
    !backgroundImage &&
    (backgroundColor === "#ffffff" ||
      backgroundColor === "#fff" ||
      backgroundColor?.toLowerCase().includes("fff") ||
      backgroundColor?.toLowerCase().includes("white"));

  const textColorClass = isLightBackground ? "text-gray-900" : "text-white";
  const buttonClass = isLightBackground
    ? "bg-gray-900 text-white hover:bg-gray-800"
    : "bg-white text-gray-900 hover:bg-gray-100";

  // Стили для фона
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: backgroundImage ? undefined : backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: backgroundImage ? "cover" : undefined,
    backgroundPosition: backgroundImage ? "center" : undefined,
    backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
  };

  return (
    <section
      className="relative h-screen flex items-center"
      style={backgroundStyle}
      data-tina-field={tinaField(data, "backgroundImage")}
    >
      {/* Overlay для читаемости текста на фоновом изображении */}
      {backgroundImage && <div className="absolute inset-0 bg-black/20" />}

      <div className="relative z-10 mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Левая часть: Заголовок, описание, кнопка */}
          <div className={textColorClass}>
            {heroData?.headline && (
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
                data-tina-field={tinaField(data, "headline")}
              >
                {heroData.headline}
              </h1>
            )}

            {heroData?.description && (
              <p
                className={`text-lg md:text-xl mb-8 ${
                  isLightBackground ? "text-gray-700" : "text-white/90"
                }`}
                data-tina-field={tinaField(data, "description")}
              >
                {heroData.description}
              </p>
            )}

            {heroData?.buttonLabel && (
              <div data-tina-field={tinaField(data, "buttonLabel")}>
                <Button
                  asChild
                  size="lg"
                  className={`${buttonClass} rounded-lg px-8 py-6 text-lg font-semibold`}
                >
                  <Link href={heroData.buttonLink || "#"}>
                    {heroData.buttonLabel}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Правая часть: Преимущества */}
          {heroData?.benefits && heroData.benefits.length > 0 && (
            <div className="space-y-4">
              {heroData.benefits.map(
                (benefit: any, index: number) =>
                  benefit?.text && (
                    <div
                      key={index}
                      className={`text-lg md:text-xl ${
                        isLightBackground ? "text-gray-700" : "text-white"
                      }`}
                      data-tina-field={tinaField(benefit, "text")}
                    >
                      {benefit.text}
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const heroBlockSchema: Template = {
  name: "hero",
  label: "Главный блок",
  ui: {
    previewSrc: "/blocks/hero.png",
    defaultItem: {
      headline: "Шпагат - это просто",
      description: "Занимайся в центре города в уютной и светлой студии.",
      buttonLabel: "Записаться",
      buttonLink: "#",
    },
  },
  fields: [
    {
      type: "string",
      label: "Заголовок",
      name: "headline",
      required: true,
    },
    {
      type: "string",
      label: "Описание",
      name: "description",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "string",
      label: "Текст кнопки",
      name: "buttonLabel",
    },
    {
      type: "string",
      label: "Ссылка кнопки",
      name: "buttonLink",
    },
    {
      type: "image",
      label: "Фоновое изображение",
      name: "backgroundImage",
      description: "Если не указано, будет использован цвет фона",
      // @ts-ignore
      uploadDir: () => "hero",
    },
    {
      type: "string",
      label: "Цвет фона",
      name: "backgroundColor",
      description: "Используется, если не указано фоновое изображение",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "object",
      label: "Преимущества",
      name: "benefits",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.text || "Преимущество" };
        },
        defaultItem: {
          text: "",
        },
      },
      fields: [
        {
          type: "string",
          label: "Текст",
          name: "text",
        },
      ],
    },
  ],
};
