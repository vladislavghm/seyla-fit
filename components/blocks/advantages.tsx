"use client";
import React from "react";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageBlocksAdvantages } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Section } from "@/components/layout/section";
import { ColorPickerInput } from "@/tina/fields/colorPicker";
import { motion } from "motion/react";

export const Advantages = ({ data }: { data: PageBlocksAdvantages }) => {
  return (
    <Section
      backgroundColor={(data as any).backgroundColor}
      className="py-16 lg:py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        {data.advantagesTitle && (
          <motion.h2
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            data-tina-field={tinaField(data, "advantagesTitle")}
            className="mb-12 text-center text-4xl font-bold lg:text-5xl"
          >
            {data.advantagesTitle}
          </motion.h2>
        )}

        <div className="space-y-8">
          {data.advantagesItems &&
            data.advantagesItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: index * 0.15,
                }}
                className="border-t border-gray-300 pt-8 first:border-t-0 first:pt-0"
              >
                <div className="flex gap-6">
                  <div className="shrink-0">
                    <span className="text-2xl font-light text-gray-500">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                  </div>
                  <div className="flex-1">
                    {item?.advantagesItemTitle && (
                      <h3
                        data-tina-field={tinaField(item, "advantagesItemTitle")}
                        className="mb-3 text-xl font-bold lg:text-2xl"
                      >
                        {item.advantagesItemTitle}
                      </h3>
                    )}
                    {item?.advantagesItemDescription && (
                      <div
                        data-tina-field={tinaField(
                          item,
                          "advantagesItemDescription",
                        )}
                        className="prose prose-lg max-w-none"
                      >
                        <TinaMarkdown
                          content={item.advantagesItemDescription}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </Section>
  );
};

export const advantagesBlockSchema: Template = {
  name: "advantages",
  label: "Преимущества",
  ui: {
    previewSrc: "/blocks/advantages.png",
    defaultItem: {
      advantagesTitle: "— ПРЕИМУЩЕСТВА",
      advantagesItems: [
        {
          advantagesItemTitle: "МЕСТОПОЛОЖЕНИЕ",
          advantagesItemDescription:
            "Студия в центре со своей парковкой. Круглосуточная охрана здания и видеонаблюдение.",
        },
        {
          advantagesItemTitle: "МИНИ-ГРУППЫ",
          advantagesItemDescription:
            "От 2-х до 8-ми человек, персональный подход даже на групповых тренировках.",
        },
        {
          advantagesItemTitle: "ОГРАНИЧЕНИЙ НЕТ",
          advantagesItemDescription:
            "Абонемент действует на любые направления, ты можешь посещать любые занятия.",
        },
      ],
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
      name: "advantagesTitle",
    },
    {
      type: "object",
      label: "Преимущества",
      name: "advantagesItems",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.advantagesItemTitle || "Преимущество",
          };
        },
        defaultItem: {
          advantagesItemTitle: "",
          advantagesItemDescription: "",
        },
      },
      fields: [
        {
          type: "string",
          label: "Заголовок преимущества",
          name: "advantagesItemTitle",
        },
        {
          type: "rich-text",
          label: "Описание",
          name: "advantagesItemDescription",
        },
      ],
    },
  ],
};
