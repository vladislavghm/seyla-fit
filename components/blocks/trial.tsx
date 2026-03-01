"use client";
import React, { useState } from "react";
import Image from "next/image";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageBlocksTrial } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { ColorPickerInput } from "@/tina/fields/colorPicker";
import { motion } from "motion/react";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export const Trial = ({ data }: { data: PageBlocksTrial }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitStatus("loading");
    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitStatus("error");
        setSubmitError(json.error || "Не удалось отправить заявку");
        return;
      }
      setSubmitStatus("success");
      setFormData({ fullName: "", phone: "" });
    } catch {
      setSubmitStatus("error");
      setSubmitError("Ошибка сети. Попробуйте позже.");
    }
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

  return (
    <div id="trial" className="relative py-16 lg:py-24 min-h-[600px] scroll-mt-20 overflow-hidden">
      {/* Фоновое изображение */}
      {data.trialBackgroundImage && (
        <div
          className="absolute inset-0"
          data-tina-field={tinaField(data, "trialBackgroundImage")}
        >
          <Image
            src={data.trialBackgroundImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

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
          style={{
            backgroundColor: (data as any).backgroundColor || "transparent",
          }}
        />
      )}

      {/* Контент */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* Левая часть: Текст — появление слева по очереди */}
          <div className="text-white">
            {data.trialHeadline && (
              <motion.h2
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                data-tina-field={tinaField(data, "trialHeadline")}
                className="mb-6 text-3xl font-bold lg:text-4xl xl:text-5xl"
              >
                {data.trialHeadline}
              </motion.h2>
            )}
            {data.trialDescription && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                data-tina-field={tinaField(data, "trialDescription")}
                className="prose prose-lg prose-invert max-w-none"
              >
                <TinaMarkdown content={data.trialDescription} />
              </motion.div>
            )}
          </div>

          {/* Правая часть: Форма — подъезжает справа целиком */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="bg-white rounded-lg p-8 shadow-xl"
          >
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

              {/* Сообщение об успехе / ошибке */}
              {submitStatus === "success" && (
                <p className="text-green-600 text-sm font-medium">
                  Заявка отправлена! Мы свяжемся с вами в ближайшее время.
                </p>
              )}
              {submitStatus === "error" && submitError && (
                <p className="text-red-600 text-sm font-medium">
                  {submitError}
                </p>
              )}

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="w-full py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: (data as any).trialFormButtonColor || "#1f2937",
                  color: (data as any).trialFormButtonTextColor || "#ffffff",
                }}
                data-tina-field={tinaField(data, "trialFormButtonText")}
              >
                {submitStatus === "loading"
                  ? "Отправка..."
                  : data.trialFormButtonText || "Записаться"}
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
          </motion.div>
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
    {
      type: "string",
      label: "Цвет фона",
      name: "backgroundColor",
      description:
        "Цвет фона секции (как в блоке «Бегущая строка»). Используется, если не задано фоновое изображение.",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "image",
      label: "Фоновое изображение",
      name: "trialBackgroundImage",
      description: "Фоновое изображение для блока",
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
    },
    {
      type: "string",
      label: "Placeholder поля ФИО",
      name: "trialFormNamePlaceholder",
    },
    {
      type: "string",
      label: "Подпись поля телефона",
      name: "trialFormPhoneLabel",
    },
    {
      type: "string",
      label: "Placeholder поля телефона",
      name: "trialFormPhonePlaceholder",
    },
    {
      type: "string",
      label: "Текст кнопки",
      name: "trialFormButtonText",
    },
    {
      type: "string",
      label: "Цвет кнопки формы",
      name: "trialFormButtonColor",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "string",
      label: "Цвет текста кнопки формы",
      name: "trialFormButtonTextColor",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "string",
      label: "Текст о политике конфиденциальности",
      name: "trialFormDisclaimer",
      ui: {
        component: "textarea",
      },
    },
  ],
};
