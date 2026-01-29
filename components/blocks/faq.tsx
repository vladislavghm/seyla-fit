"use client";
import React, { useState } from "react";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageBlocksFaq } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Section } from "@/components/layout/section";
import { ColorPickerInput } from "@/tina/fields/colorPicker";
import { motion, AnimatePresence } from "motion/react";

export const Faq = ({ data }: { data: PageBlocksFaq }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(
    data.faqDefaultOpen !== undefined ? data.faqDefaultOpen : null,
  );

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section
      backgroundColor={(data as any).backgroundColor}
      className="py-16 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-6">
        {data.faqTitle && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            data-tina-field={tinaField(data, "faqTitle")}
            className="mb-12 text-center text-4xl font-bold lg:text-5xl"
          >
            {data.faqTitle}
          </motion.h2>
        )}

        <div className="space-y-4">
          {data.faqItems &&
            data.faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: index * 0.1,
                  }}
                  className="border-b border-gray-200 last:border-b-0"
                  data-tina-field={tinaField(item)}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    {item?.faqItemQuestion && (
                      <h3
                        data-tina-field={tinaField(item, "faqItemQuestion")}
                        className="flex-1 text-xl font-bold lg:text-2xl pr-4"
                      >
                        {item.faqItemQuestion}
                      </h3>
                    )}
                    <motion.span
                      className="shrink-0 text-2xl font-light text-gray-600"
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isOpen ? "×" : "+"}
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {isOpen && item?.faqItemAnswer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                        data-tina-field={tinaField(item, "faqItemAnswer")}
                      >
                        <div className="pb-6 prose prose-lg max-w-none text-gray-700">
                          <TinaMarkdown content={item.faqItemAnswer} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
        </div>
      </div>
    </Section>
  );
};

export const faqBlockSchema: Template = {
  name: "faq",
  label: "FAQ / Часто задаваемые вопросы",
  ui: {
    previewSrc: "/blocks/faq.png",
    defaultItem: {
      faqTitle: "Часто задаваемые вопросы",
      faqItems: [
        {
          faqItemQuestion: "Что брать с собой на тренировку?",
          faqItemAnswer:
            "С собой нужно взять удобную спортивную одежду (топ, легинсы, носки). На занятия с гамаками обязательно футболку, закрывающую область подмышечных впадин, на full body сменные кроссовки.",
        },
        {
          faqItemQuestion: "Предоставляется ли инвентарь?",
          faqItemAnswer:
            "Да, весь необходимый инвентарь предоставляется студией.",
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
      name: "faqTitle",
      description: "Заголовок блока FAQ (опционально)",
    },
    {
      type: "number",
      label: "Открытый по умолчанию",
      name: "faqDefaultOpen",
      description:
        "Индекс вопроса, который будет открыт по умолчанию (начиная с 0). Оставьте пустым, если все должны быть закрыты.",
    },
    {
      type: "object",
      label: "Вопросы и ответы",
      name: "faqItems",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.faqItemQuestion || "Новый вопрос",
          };
        },
        defaultItem: {
          faqItemQuestion: "",
          faqItemAnswer: "",
        },
      },
      fields: [
        {
          type: "string",
          label: "Вопрос",
          name: "faqItemQuestion",
          required: true,
        },
        {
          type: "rich-text",
          label: "Ответ",
          name: "faqItemAnswer",
          required: true,
        },
      ],
    },
  ],
};
