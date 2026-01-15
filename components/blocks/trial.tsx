"use client";
import React, { useState } from "react";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageBlocksTrial } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { sectionBlockSchemaField } from "@/components/layout/section";

export const Trial = ({ data }: { data: PageBlocksTrial }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно добавить логику отправки формы
    console.log("Form submitted:", formData);
    // Можно добавить отправку на сервер или интеграцию с внешним сервисом
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Удаляем все нецифровые символы
    if (value.startsWith("8")) {
      value = "7" + value.slice(1);
    }
    if (value.startsWith("7")) {
      value = value.slice(0, 11);
      let formatted = "+7";
      if (value.length > 1) {
        formatted += ` (${value.slice(1, 4)}`;
      }
      if (value.length >= 4) {
        formatted += `) ${value.slice(4, 7)}`;
      }
      if (value.length >= 7) {
        formatted += `-${value.slice(7, 9)}`;
      }
      if (value.length >= 9) {
        formatted += `-${value.slice(9, 11)}`;
      }
      setFormData({ ...formData, phone: formatted });
    } else {
      setFormData({ ...formData, phone: value });
    }
  };

  // Вычисляем прозрачность оверлея (0-1, где 0 = прозрачный, 1 = непрозрачный)
  const overlayOpacity =
    data.trialOverlayOpacity !== undefined && data.trialOverlayOpacity !== null
      ? Math.max(0, Math.min(1, data.trialOverlayOpacity / 100))
      : 0.3;

  const backgroundStyle: React.CSSProperties = data.trialBackgroundImage
    ? {
        backgroundImage: `url(${data.trialBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", // Фиксированный фон
      }
    : {};

  return (
    <div
      className="relative py-16 lg:py-24 min-h-[600px]"
      style={backgroundStyle}
    >
      {/* Оверлей с настраиваемой прозрачностью */}
      {data.trialBackgroundImage && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
          data-tina-field={tinaField(data, "trialOverlayOpacity")}
        />
      )}

      {/* Фон для контента (если нет изображения) */}
      {!data.trialBackgroundImage && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: data.background || "transparent" }}
        />
      )}

      {/* Tina field для фонового изображения */}
      {data.trialBackgroundImage && (
        <div
          className="hidden"
          data-tina-field={tinaField(data, "trialBackgroundImage")}
        />
      )}

      {/* Контент */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* Левая часть: Текст */}
          <div className="text-white">
            {data.trialHeadline && (
              <h2
                data-tina-field={tinaField(data, "trialHeadline")}
                className="mb-6 text-3xl font-bold lg:text-4xl xl:text-5xl"
              >
                {data.trialHeadline}
              </h2>
            )}
            {data.trialDescription && (
              <div
                data-tina-field={tinaField(data, "trialDescription")}
                className="prose prose-lg prose-invert max-w-none"
              >
                <TinaMarkdown content={data.trialDescription} />
              </div>
            )}
          </div>

          {/* Правая часть: Форма */}
          <div className="bg-white rounded-lg p-8 shadow-xl">
            {data.trialFormTitle && (
              <h3
                data-tina-field={tinaField(data, "trialFormTitle")}
                className="mb-2 text-2xl font-bold text-gray-900"
              >
                {data.trialFormTitle}
              </h3>
            )}
            {data.trialFormDescription && (
              <p
                data-tina-field={tinaField(data, "trialFormDescription")}
                className="mb-6 text-gray-600"
              >
                {data.trialFormDescription}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Поле ФИО */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {data.trialFormNameLabel || "ФИО"}
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder={
                    data.trialFormNamePlaceholder || "Фамилия Имя Отчество"
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  data-tina-field={tinaField(data, "trialFormNameLabel")}
                />
              </div>

              {/* Поле телефона */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {data.trialFormPhoneLabel || "Номер телефона"}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl">
                    🇷🇺
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder={
                      data.trialFormPhonePlaceholder || "+7 (000) 000-00-00"
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    data-tina-field={tinaField(data, "trialFormPhoneLabel")}
                  />
                </div>
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                className="w-full bg-gray-800 text-white py-3 px-6 rounded-md font-medium hover:bg-gray-900 transition-colors"
                data-tina-field={tinaField(data, "trialFormButtonText")}
              >
                {data.trialFormButtonText || "Записаться"}
              </button>

              {/* Текст о политике конфиденциальности */}
              {data.trialFormDisclaimer && (
                <p
                  data-tina-field={tinaField(data, "trialFormDisclaimer")}
                  className="text-xs text-gray-500 text-center"
                >
                  {data.trialFormDisclaimer}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const trialBlockSchema: Template = {
  name: "trial",
  label: "Запись на пробное занятие",
  ui: {
    previewSrc: "/blocks/trial.png",
    defaultItem: {
      trialHeadline:
        "Запишись на пробное занятие и получи -10% скидку на покупку твоего первого абонемента!",
      trialDescription:
        "Абонемент действует на все направления — выбирай, сколько тренировок включить 4/8/12 и занимайся по удобному графику, ведь студия работает каждый день.",
      trialFormTitle: "Запишись на пробное занятие",
      trialFormDescription:
        "Познакомься с тренерами, посмотри на студию и получи скидку на свой первый абонемент",
      trialFormNameLabel: "ФИО",
      trialFormNamePlaceholder: "Фамилия Имя Отчество",
      trialFormPhoneLabel: "Номер телефона",
      trialFormPhonePlaceholder: "+7 (000) 000-00-00",
      trialFormButtonText: "Записаться",
      trialFormDisclaimer:
        "Отправляя данные, Вы соглашаетесь с политикой конфиденциальности.",
      trialOverlayOpacity: 30,
    },
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: "image",
      label: "Фоновое изображение",
      name: "trialBackgroundImage",
      description: "Фоновое изображение для блока (будет с fixed attachment)",
      // @ts-ignore
      uploadDir: () => "trial",
    },
    {
      type: "number",
      label: "Прозрачность оверлея (%)",
      name: "trialOverlayOpacity",
      description:
        "Уровень затемнения фона (0-100, где 0 = прозрачный, 100 = полностью черный)",
      ui: {
        component: "number",
      },
      default: 30,
    },
    {
      type: "string",
      label: "Заголовок",
      name: "trialHeadline",
      required: true,
    },
    {
      type: "rich-text",
      label: "Описание",
      name: "trialDescription",
    },
    {
      type: "string",
      label: "Заголовок формы",
      name: "trialFormTitle",
      default: "Запишись на пробное занятие",
    },
    {
      type: "string",
      label: "Описание формы",
      name: "trialFormDescription",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "string",
      label: "Подпись поля ФИО",
      name: "trialFormNameLabel",
      default: "ФИО",
    },
    {
      type: "string",
      label: "Placeholder поля ФИО",
      name: "trialFormNamePlaceholder",
      default: "Фамилия Имя Отчество",
    },
    {
      type: "string",
      label: "Подпись поля телефона",
      name: "trialFormPhoneLabel",
      default: "Номер телефона",
    },
    {
      type: "string",
      label: "Placeholder поля телефона",
      name: "trialFormPhonePlaceholder",
      default: "+7 (000) 000-00-00",
    },
    {
      type: "string",
      label: "Текст кнопки",
      name: "trialFormButtonText",
      default: "Записаться",
    },
    {
      type: "string",
      label: "Текст о политике конфиденциальности",
      name: "trialFormDisclaimer",
      ui: {
        component: "textarea",
      },
      default:
        "Отправляя данные, Вы соглашаетесь с политикой конфиденциальности.",
    },
  ],
};
