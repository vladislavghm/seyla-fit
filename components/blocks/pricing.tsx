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
        data.pricingSections.map((section, sectionIndex) => {
          const headerColor =
            (section as any)?.headerColor ?? (data as any)?.headerColor ?? "#e06b6b";
          return (
            <React.Fragment key={sectionIndex}>
              {/* Заголовок в стиле блока Направления */}
              <div
                id={sectionIndex === 0 ? "tickets" : undefined}
                className="relative overflow-hidden py-8 px-6 lg:py-12 lg:px-12 w-full scroll-mt-20"
                style={{ backgroundColor: headerColor }}
                data-tina-field={tinaField(section as any, "headerColor" as any)}
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
                      ЦЕНЫ
                    </h2>
                  </div>
                  <div className="relative z-10 text-center">
                    {section?.pricingSectionTitle && (
                      <motion.h2
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        data-tina-field={tinaField(section, "pricingSectionTitle")}
                        className="mb-4 text-4xl lg:text-6xl font-bold text-white"
                      >
                        {section.pricingSectionTitle}
                      </motion.h2>
                    )}
                    {(section as any)?.pricingSectionSubtitle && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        data-tina-field={tinaField(section as any, "pricingSectionSubtitle")}
                        className="text-lg lg:text-xl text-white/90"
                      >
                        {(section as any).pricingSectionSubtitle}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              <Section
                backgroundColor={
                  (section as any)?.backgroundColor ??
                  (data as any)?.backgroundColor
                }
                className="py-16 lg:py-24"
                data-tina-field={tinaField(section)}
              >
            <div className="mx-auto max-w-7xl px-6">
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
                            className="w-full py-3 px-6 rounded-md font-medium transition-colors hover:opacity-90"
                            style={{
                              backgroundColor: (item as any)?.pricingItemButtonColor || "#1f2937",
                              color: (item as any)?.pricingItemButtonTextColor || "#ffffff",
                            }}
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
            </React.Fragment>
          );
        })}
    </>
  );
};

export const pricingBlockSchema: Template = {
  name: "pricing",
  label: "Цены/Абонементы",
  ui: {
    previewSrc: "/blocks/pricing.png",
    defaultItem: {
      headerColor: "#e06b6b",
      pricingSections: [
        {
          pricingSectionTitle: "Абонементы полного дня",
          headerColor: "#e06b6b",
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
      label: "Цвет шапки (по умолчанию)",
      name: "headerColor",
      description: "Цвет шапки с заголовком, если не задан для секции",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
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
          label: "Цвет шапки",
          name: "headerColor",
          description: "Цвет фона шапки с заголовком секции",
          ui: {
            // @ts-ignore
            component: ColorPickerInput,
          },
        },
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
          type: "string",
          label: "Подзаголовок секции",
          name: "pricingSectionSubtitle",
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
            },
            {
              type: "string",
              label: "Ссылка кнопки",
              name: "pricingItemButtonLink",
              description: "URL для кнопки покупки",
            },
            {
              type: "string",
              label: "Цвет кнопки",
              name: "pricingItemButtonColor",
              ui: {
                // @ts-ignore
                component: ColorPickerInput,
              },
            },
            {
              type: "string",
              label: "Цвет текста кнопки",
              name: "pricingItemButtonTextColor",
              ui: {
                // @ts-ignore
                component: ColorPickerInput,
              },
            },
          ],
        },
      ],
    },
  ],
};
