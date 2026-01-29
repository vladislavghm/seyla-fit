"use client";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import type { Template } from "tinacms";
import { tinaField } from "tinacms/dist/react";
import { PageBlocksHero } from "@/tina/__generated__/types";
import { Button } from "@/components/ui/button";
import { ColorPickerInput } from "@/tina/fields/colorPicker";
import { motion } from "motion/react";
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
  const buttonClass =
    "bg-white text-gray-900 border-2 border-white hover:bg-gray-800 hover:text-white hover:border-white transition-all duration-300";

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

      {/* Левая часть: Заголовок, описание, кнопка */}
      <div
        className={`relative z-10 w-full max-w-[766px] px-4 sm:px-6 lg:px-8 ${textColorClass}`}
      >
        {heroData?.headline && (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            data-tina-field={tinaField(data, "headline")}
          >
            {heroData.headline}
          </motion.h1>
        )}

        {heroData?.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className={`text-lg md:text-xl mb-8 ${
              isLightBackground ? "text-gray-700" : "text-white/90"
            }`}
            data-tina-field={tinaField(data, "description")}
          >
            {heroData.description}
          </motion.p>
        )}

        {heroData?.buttonLabel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            data-tina-field={tinaField(data, "buttonLabel")}
          >
            <Button
              asChild
              size="lg"
              className={`${buttonClass} rounded-none px-8 py-4 text-lg font-semibold`}
            >
              <Link
                href={
                  heroData.buttonLink && heroData.buttonLink !== "#"
                    ? heroData.buttonLink
                    : "#trial"
                }
              >
                {heroData.buttonLabel}
              </Link>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Преимущества с абсолютным позиционированием относительно секции */}
      {heroData?.benefits && heroData.benefits.length > 0 && (
        <>
          {/* Десктопная версия: абсолютное позиционирование */}
          {heroData.benefits.map(
            (benefit: any, index: number) =>
              benefit?.text && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: 0.6 + index * 0.2,
                  }}
                  className={`hidden lg:block absolute text-right text-lg md:text-xl lg:text-xl max-w-md z-10 ${
                    isLightBackground ? "text-gray-700" : "text-white"
                  }`}
                  style={{
                    right: "5%",
                    top: `${30 + index * 20}%`,
                  }}
                  data-tina-field={tinaField(benefit, "text")}
                >
                  {benefit.text}
                </motion.div>
              ),
          )}

          {/* Мобильная версия: в списке */}
          <div className="lg:hidden relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
            <div className="flex flex-col items-end space-y-4">
              {heroData.benefits.map(
                (benefit: any, index: number) =>
                  benefit?.text && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: 0.6 + index * 0.2,
                      }}
                      className={`text-right text-lg md:text-xl ${
                        isLightBackground ? "text-gray-700" : "text-white"
                      }`}
                      data-tina-field={tinaField(benefit, "text")}
                    >
                      {benefit.text}
                    </motion.div>
                  ),
              )}
            </div>
          </div>
        </>
      )}
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
      buttonLink: "#trial",
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
