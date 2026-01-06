"use client";
import React from "react";
import type { Template } from "tinacms";
import { tinaField } from "tinacms/dist/react";
import { PageBlocksMarquee } from "@/tina/__generated__/types";
import { ColorPickerInput } from "@/tina/fields/colorPicker";

export const Marquee = ({ data }: { data: PageBlocksMarquee }) => {
  const marqueeData = data as any;
  const text = marqueeData?.text || "Ты — не тяни время — тяни шпагаты";
  const backgroundColor = marqueeData?.backgroundColor || "#f3f4f6";
  const textColor = marqueeData?.textColor || "#4b5563";

  // Создаем массив текста для бесконечной прокрутки
  const repeatedText = Array(10).fill(text).join(" — ");

  return (
    <div
      className="relative overflow-hidden py-4"
      style={{ backgroundColor }}
      data-tina-field={tinaField(data, "text")}
    >
      <div className="flex whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span
            className="text-lg font-medium px-4"
            style={{ color: textColor }}
          >
            {repeatedText}
          </span>
        </div>
        <div className="animate-marquee inline-block" aria-hidden="true">
          <span
            className="text-lg font-medium px-4"
            style={{ color: textColor }}
          >
            {repeatedText}
          </span>
        </div>
      </div>
    </div>
  );
};

export const marqueeBlockSchema: Template = {
  name: "marquee",
  label: "Бегущая строка",
  ui: {
    previewSrc: "/blocks/marquee.png",
    defaultItem: {
      text: "Ты — не тяни время — тяни шпагаты",
    },
  },
  fields: [
    {
      type: "string",
      label: "Текст",
      name: "text",
      description: "Текст для бегущей строки",
    },
    {
      type: "string",
      label: "Цвет фона",
      name: "backgroundColor",
      description: "Цвет фона бегущей строки",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "string",
      label: "Цвет текста",
      name: "textColor",
      description: "Цвет текста",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
  ],
};
