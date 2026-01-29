"use client";
import React from "react";
import type { Template } from "tinacms";
import type { PageBlocksContacts } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Section } from "@/components/layout/section";
import { ColorPickerInput } from "@/tina/fields/colorPicker";
import { Icon } from "@/components/icon";
import { normalizeIconData } from "@/lib/icon-utils";
import { iconSchema } from "@/tina/fields/icon";
import { motion } from "motion/react";

export const Contacts = ({ data }: { data: PageBlocksContacts }) => {
  return (
    <Section
      backgroundColor={(data as any).backgroundColor}
      className="py-16 lg:py-24"
      id="contacts"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Левая часть: Контактная информация — появление слева по очереди */}
          <div className="space-y-6">
            {data.contactsTitle && (
              <motion.h2
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                data-tina-field={tinaField(data, "contactsTitle")}
                className="text-3xl font-bold lg:text-4xl"
              >
                {data.contactsTitle}
              </motion.h2>
            )}

            {/* Телефон */}
            {data.contactsPhone && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                data-tina-field={tinaField(data, "contactsPhone")}
              >
                <a
                  href={`tel:${data.contactsPhone.replace(/\D/g, "")}`}
                  className="text-2xl font-bold hover:opacity-70 transition-opacity"
                >
                  {data.contactsPhone}
                </a>
              </motion.div>
            )}

            {/* Адрес */}
            {data.contactsAddress && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
                data-tina-field={tinaField(data, "contactsAddress")}
                className="text-lg text-gray-600"
              >
                {data.contactsAddress}
              </motion.div>
            )}

            {/* Социальные сети */}
            {data.contactsSocial && data.contactsSocial.length > 0 && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
                className="flex items-center gap-3 pt-4"
              >
                {data.contactsSocial.map((social, index) => {
                  if (
                    !social?.contactsSocialIcon ||
                    !social?.contactsSocialUrl
                  ) {
                    return null;
                  }
                  const iconData = normalizeIconData(
                    social.contactsSocialIcon,
                    "small",
                  );
                  if (!iconData) return null;

                  return (
                    <a
                      key={index}
                      href={social.contactsSocialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:opacity-70 transition-opacity"
                      aria-label={iconData.name || "Social link"}
                      data-tina-field={tinaField(social, "contactsSocialUrl")}
                    >
                      <Icon data={iconData} className="w-[30px] h-[30px]" />
                    </a>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Правая часть: Яндекс Карта — подъезжает справа */}
          {data.contactsMapUrl && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden"
              data-tina-field={tinaField(data, "contactsMapUrl")}
            >
              <iframe
                src={data.contactsMapUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                style={{ border: 0 }}
                title="Карта"
              />
            </motion.div>
          )}
        </div>
      </div>
    </Section>
  );
};

export const contactsBlockSchema: Template = {
  name: "contacts",
  label: "Контакты",
  ui: {
    previewSrc: "/blocks/contacts.png",
    defaultItem: {
      contactsTitle: "Контакты:",
      contactsPhone: "+7 (988) 510 08 80",
      contactsAddress: "г. Ростов-на-Дону, ул. Мечникова 33А (2 этаж).",
      contactsSocial: [
        {
          contactsSocialIcon: {
            name: "FaWhatsapp",
            color: "#25D366",
          },
          contactsSocialUrl: "https://wa.me/79885100880",
        },
        {
          contactsSocialIcon: {
            name: "AiFillInstagram",
            color: "#E4405F",
          },
          contactsSocialUrl: "https://instagram.com/seylafit",
        },
        {
          contactsSocialIcon: {
            name: "Vk",
            color: "#0077FF",
          },
          contactsSocialUrl: "https://vk.com/seylafit",
        },
      ],
      contactsMapUrl:
        "https://yandex.ru/map-widget/v1/?ll=39.7136%2C47.2356&z=16&pt=39.7136%2C47.2356",
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
      name: "contactsTitle",
    },
    {
      type: "string",
      label: "Телефон",
      name: "contactsPhone",
      description: "Номер телефона для связи",
    },
    {
      type: "string",
      label: "Адрес",
      name: "contactsAddress",
      ui: {
        component: "textarea",
      },
      description: "Адрес студии",
    },
    {
      type: "object",
      label: "Социальные сети",
      name: "contactsSocial",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.contactsSocialIcon?.name || "Социальная сеть",
          };
        },
        defaultItem: {
          contactsSocialIcon: {
            name: "FaWhatsapp",
            color: "green",
            style: "regular",
          },
          contactsSocialUrl: "",
        },
      },
      fields: [
        {
          ...iconSchema,
          name: "contactsSocialIcon",
          label: "Иконка",
        } as any,
        {
          type: "string",
          label: "Ссылка",
          name: "contactsSocialUrl",
          description: "URL страницы в социальной сети",
        },
      ],
    },
    {
      type: "string",
      label: "URL Яндекс Карты (iframe)",
      name: "contactsMapUrl",
      description:
        "URL для встраивания карты через iframe. Получить можно: 1) На Яндекс.Картах нажмите 'Поделиться' → 'Виджет карты' → скопируйте src из iframe. 2) Или используйте Конструктор карт: yandex.ru/dev/constructor",
      ui: {
        component: "textarea",
      },
    },
  ],
};
