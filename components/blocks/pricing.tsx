"use client";
import React from "react";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageBlocksPricing } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Section } from "@/components/layout/section";
import { ColorPickerInput } from "@/tina/fields/colorPicker";
import { motion } from "motion/react";

export const Pricing = ({ data }: { data: PageBlocksPricing }) => {
  return (
    <>
      {data.pricingSections &&
        data.pricingSections.map((section, sectionIndex) => (
          <Section
            key={sectionIndex}
            backgroundColor={
              (section as any)?.backgroundColor ??
              (data as any)?.backgroundColor
            }
            className="py-16 lg:py-24"
            id={sectionIndex === 0 ? "tickets" : undefined}
            data-tina-field={tinaField(section)}
          >
            <div className="mx-auto max-w-7xl px-6">
              {/* Заголовок секции */}
              {section?.pricingSectionTitle && (
                <motion.h2
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  data-tina-field={tinaField(section, "pricingSectionTitle")}
                  className="mb-12 text-center text-4xl font-bold lg:text-5xl"
                >
                  {section.pricingSectionTitle}
                </motion.h2>
              )}

              {/* Тарифы секции */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section?.pricingSectionItems &&
                  section.pricingSectionItems.map((item, itemIndex) => {
                    // Определяем направление анимации: четные секции - слева, нечетные - справа
                    const direction = sectionIndex % 2 === 0 ? -50 : 50;
                    return (
                      <motion.div
                        key={itemIndex}
                        initial={{ x: direction, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          ease: "easeOut",
                          delay: itemIndex * 0.1,
                        }}
                        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                        data-tina-field={tinaField(item)}
                      >
                        {/* Название/Описание */}
                        {item?.pricingItemTitle && (
                          <h3
                            data-tina-field={tinaField(
                              item,
                              "pricingItemTitle",
                            )}
                            className="mb-2 text-lg font-semibold"
                          >
                            {item.pricingItemTitle}
                          </h3>
                        )}
                        {item?.pricingItemSubtitle && (
                          <p
                            data-tina-field={tinaField(
                              item,
                              "pricingItemSubtitle",
                            )}
                            className="mb-4 text-sm text-gray-600"
                          >
                            {item.pricingItemSubtitle}
                          </p>
                        )}

                        {/* Цены */}
                        <div className="mb-6">
                          {item?.pricingItemOldPrice && (
                            <div
                              data-tina-field={tinaField(
                                item,
                                "pricingItemOldPrice",
                              )}
                              className="text-sm text-gray-400 line-through"
                            >
                              {item.pricingItemOldPrice}
                            </div>
                          )}
                          {item?.pricingItemPrice && (
                            <div
                              data-tina-field={tinaField(
                                item,
                                "pricingItemPrice",
                              )}
                              className="text-3xl font-bold"
                            >
                              {item.pricingItemPrice}
                            </div>
                          )}
                        </div>

                        {/* Кнопка */}
                        {item?.pricingItemButtonText && (
                          <button
                            data-tina-field={tinaField(
                              item,
                              "pricingItemButtonText",
                            )}
                            className="w-full bg-gray-800 text-white py-3 px-6 rounded-md font-medium hover:bg-gray-900 transition-colors"
                            onClick={() => {
                              if (item?.pricingItemButtonLink) {
                                window.location.href =
                                  item.pricingItemButtonLink;
                              }
                            }}
                          >
                            {item.pricingItemButtonText}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </Section>
        ))}
    </>
  );
};

export const pricingBlockSchema: Template = {
  name: "pricing",
  label: "Цены/Абонементы",
  ui: {
    previewSrc: "/blocks/pricing.png",
    defaultItem: {
      pricingSections: [
        {
          pricingSectionTitle: "Абонементы полного дня",
          pricingSectionItems: [
            {
              pricingItemTitle: "4 групповых занятия",
              pricingItemOldPrice: "3200P",
              pricingItemPrice: "2800P",
              pricingItemButtonText: "Купить",
              pricingItemButtonLink: "#",
            },
          ],
        },
      ],
    },
  },
  fields: [
    {
      type: "string",
      label: "Цвет фона",
      name: "backgroundColor",
      description:
        "Цвет фона блока (как в блоке «Бегущая строка»). Можно переопределить для каждой секции ниже.",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "object",
      label: "Секции с тарифами",
      name: "pricingSections",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.pricingSectionTitle || "Новая секция",
          };
        },
        defaultItem: {
          pricingSectionTitle: "",
          pricingSectionItems: [
            {
              pricingItemTitle: "",
              pricingItemPrice: "",
              pricingItemButtonText: "Купить",
              pricingItemButtonLink: "#",
            },
          ],
        },
      },
      fields: [
        {
          type: "string",
          label: "Цвет фона секции",
          name: "backgroundColor",
          description:
            "Цвет фона этой секции (как в блоке «Бегущая строка»). Если не задан — используется общий цвет блока.",
          ui: {
            // @ts-ignore
            component: ColorPickerInput,
          },
        },
        {
          type: "string",
          label: "Заголовок секции",
          name: "pricingSectionTitle",
          required: true,
          description:
            "Например: 'Абонементы полного дня' или 'Персональные тренировки'",
        },
        {
          type: "object",
          label: "Тарифы в секции",
          name: "pricingSectionItems",
          list: true,
          ui: {
            itemProps: (item) => {
              return {
                label: item?.pricingItemTitle || "Новый тариф",
              };
            },
            defaultItem: {
              pricingItemTitle: "",
              pricingItemPrice: "",
              pricingItemButtonText: "Купить",
              pricingItemButtonLink: "#",
            },
          },
          fields: [
            {
              type: "string",
              label: "Название",
              name: "pricingItemTitle",
              required: true,
            },
            {
              type: "string",
              label: "Подзаголовок",
              name: "pricingItemSubtitle",
              description: "Например: 'в утренней группе'",
            },
            {
              type: "string",
              label: "Старая цена (зачеркнутая)",
              name: "pricingItemOldPrice",
              description: "Оставьте пустым, если скидки нет",
            },
            {
              type: "string",
              label: "Цена",
              name: "pricingItemPrice",
              required: true,
            },
            {
              type: "string",
              label: "Текст кнопки",
              name: "pricingItemButtonText",
              default: "Купить",
            },
            {
              type: "string",
              label: "Ссылка кнопки",
              name: "pricingItemButtonLink",
              description: "URL для кнопки покупки",
            },
          ],
        },
      ],
    },
  ],
};
