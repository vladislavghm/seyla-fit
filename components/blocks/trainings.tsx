"use client";
import React from "react";
import Image from "next/image";
import type { Template } from "tinacms";
import type { PageBlocksTrainings } from "@/tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Section } from "@/components/layout/section";
import { motion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ColorPickerInput } from "@/tina/fields/colorPicker";

// Импорт стилей Swiper
import "swiper/css";
import "swiper/css/navigation";

export const Trainings = ({ data }: { data: PageBlocksTrainings }) => {
  const trainings = data.trainingsItems || [];
  const headerColor = (data as any).headerColor || "#e06b6b";
  const navigationButtonColor =
    (data as any).navigationButtonColor || "#160D80";

  return (
    <>
      {/* Заголовок с эффектом наложения - на всю ширину экрана */}
      <div
        id="direction"
        className="relative overflow-hidden py-8 px-6 lg:py-12 lg:px-12 w-full scroll-mt-20"
        style={{ backgroundColor: headerColor }}
        data-tina-field={tinaField(data as any, "headerColor" as any)}
      >
        <div className="mx-auto max-w-7xl">
          {/* Полупрозрачный текст позади */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <h2
              className="text-6xl lg:text-8xl font-bold whitespace-nowrap"
              style={{ color: `${headerColor}30` }}
            >
              РАЗРАЗНООБРАЗНЫЕ ТРЕНИРОВКИЗКИ
            </h2>
          </div>

          {/* Основной заголовок */}
          <div className="relative z-10 text-center">
            {data.trainingsTitle && (
              <motion.h2
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                data-tina-field={tinaField(data, "trainingsTitle")}
                className="mb-4 text-4xl lg:text-6xl font-bold text-white"
              >
                {data.trainingsTitle}
              </motion.h2>
            )}
            {data.trainingsSubtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                data-tina-field={tinaField(data, "trainingsSubtitle")}
                className="text-lg lg:text-xl text-white/90"
              >
                {data.trainingsSubtitle}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      <Section
        backgroundColor={(data as any).backgroundColor}
        className="py-16 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          {/* Карусель с тренировками */}
          {trainings.length > 0 && (
            <div className="relative">
              <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  1024: {
                    slidesPerView: 3,
                  },
                  1280: {
                    slidesPerView: 4,
                  },
                }}
                navigation={{
                  prevEl: ".trainings-swiper-button-prev",
                  nextEl: ".trainings-swiper-button-next",
                }}
                className="trainings-swiper"
                style={{ height: "auto" }}
              >
                {trainings
                  .filter(
                    (training): training is NonNullable<typeof training> =>
                      training !== null,
                  )
                  .map((training, index) => (
                    <SwiperSlide key={index} style={{ height: "auto" }}>
                      <div
                        data-tina-field={tinaField(training)}
                        className="h-full"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col"
                        >
                          {/* Изображение или цветной фон */}
                          <div className="relative w-full h-48 lg:h-56 overflow-hidden">
                            {training.trainingImage ? (
                              training.trainingImage.startsWith("http") ? (
                                // Для внешних URL используем unoptimized
                                <Image
                                  src={training.trainingImage}
                                  alt={training.trainingTitle || "Тренировка"}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  data-tina-field={tinaField(
                                    training,
                                    "trainingImage",
                                  )}
                                />
                              ) : (
                                // Для локальных изображений используем оптимизацию
                                <Image
                                  src={training.trainingImage}
                                  alt={training.trainingTitle || "Тренировка"}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                                  data-tina-field={tinaField(
                                    training,
                                    "trainingImage",
                                  )}
                                />
                              )
                            ) : (
                              <div
                                className="w-full h-full"
                                style={{
                                  backgroundColor:
                                    (training as any).cardColor || "#f3f4f6",
                                }}
                                data-tina-field={tinaField(
                                  training as any,
                                  "cardColor" as any,
                                )}
                              />
                            )}
                          </div>

                          {/* Контент карточки */}
                          <div className="p-6 flex-1 flex flex-col">
                            {training.trainingTitle && (
                              <h3
                                data-tina-field={tinaField(
                                  training,
                                  "trainingTitle",
                                )}
                                className="mb-3 text-xl lg:text-2xl font-bold text-gray-900"
                              >
                                {training.trainingTitle}
                              </h3>
                            )}
                            {training.trainingDescription && (
                              <p
                                data-tina-field={tinaField(
                                  training,
                                  "trainingDescription",
                                )}
                                className="text-gray-600 text-sm lg:text-base flex-1"
                              >
                                {training.trainingDescription}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </SwiperSlide>
                  ))}
              </Swiper>

              {/* Кнопки навигации */}
              <button
                className="trainings-swiper-button-prev absolute left-0 top-1/2 z-20 -translate-y-1/2 -translate-x-4 rounded-full p-3 text-white shadow-lg transition-all hover:scale-110 lg:-translate-x-6 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: navigationButtonColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                aria-label="Предыдущая тренировка"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="trainings-swiper-button-next absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-4 rounded-full p-3 text-white shadow-lg transition-all hover:scale-110 lg:translate-x-6 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: navigationButtonColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                aria-label="Следующая тренировка"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        <style jsx global>{`
          .trainings-swiper {
            padding-bottom: 1rem;
          }
          .trainings-swiper .swiper-wrapper {
            display: flex;
            align-items: stretch;
          }
          .trainings-swiper .swiper-slide {
            height: auto;
            display: flex;
          }
          .trainings-swiper-button-prev.swiper-button-disabled,
          .trainings-swiper-button-next.swiper-button-disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </Section>
    </>
  );
};

export const trainingsBlockSchema: Template = {
  name: "trainings",
  label: "Направления/Тренировки",
  ui: {
    previewSrc: "/blocks/trainings.png",
    defaultItem: {
      trainingsTitle: "РАЗНООБРАЗНЫЕ ТРЕНИРОВКИ",
      trainingsSubtitle: "для достижения любых твоих целей",
      headerColor: "#e06b6b",
      navigationButtonColor: "#160D80",
      trainingsItems: [
        {
          trainingTitle: "BODY SCULPT",
          trainingDescription:
            "силовая тренировка с дополнительным оборудованием, которая поможет вам стать сильнее, подтянуть тело, сжечь лишний жир и повысить уровень выносливости",
          trainingImage: "/uploads/trainings/body-sculpt.jpg",
        },
        {
          trainingTitle: "PILATES MAT",
          trainingDescription:
            "мягкая, но эффективная тренировка, которая помогает улучшить осанку и укрепить мышцы кора, избавиться от болей в спине, напряжения в шее и суставах",
          trainingImage: "/uploads/trainings/pilates-mat.jpg",
        },
        {
          trainingTitle: "STRETCH",
          trainingDescription:
            "если хочешь улучшить гибкость, снять напряжение в мышцах и улучшить подвижность суставов - эта тренировка для тебя!",
          trainingImage: "/uploads/trainings/stretch.jpg",
        },
        {
          trainingTitle: "ЗДОРОВАЯ СПИНА",
          trainingDescription:
            "тренировка, особенно полезная для тех, кто много времени проводит за сидячей работой. поможет снять зажимы и боли в спине, укрепить мышечный корсет и улучшить осанку",
          trainingImage: "/uploads/trainings/healthy-back.jpg",
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
        "Цвет фона секции с карточками (как в блоке «Бегущая строка»)",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "string",
      label: "Заголовок",
      name: "trainingsTitle",
      required: true,
    },
    {
      type: "string",
      label: "Подзаголовок",
      name: "trainingsSubtitle",
    },
    {
      type: "string",
      label: "Цвет шапки",
      name: "headerColor",
      description: "Цвет фона шапки с заголовком",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "string",
      label: "Цвет кнопок навигации",
      name: "navigationButtonColor",
      description:
        "Цвет кнопок навигации слайдера (по умолчанию основной цвет сайта)",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "object",
      label: "Тренировки",
      name: "trainingsItems",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.trainingTitle || "Новая тренировка",
          };
        },
        defaultItem: {
          trainingTitle: "",
          trainingDescription: "",
          trainingImage: "",
          cardColor: "#f3f4f6",
        },
      },
      fields: [
        {
          type: "string",
          label: "Название тренировки",
          name: "trainingTitle",
          required: true,
        },
        {
          type: "string",
          label: "Описание",
          name: "trainingDescription",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "image",
          label: "Изображение",
          name: "trainingImage",
          description: "Если не указано, будет использован цвет фона",
          // @ts-ignore
          uploadDir: () => "trainings",
        },
        {
          type: "string",
          label: "Цвет фона карточки",
          name: "cardColor",
          description:
            "Используется, если не указано изображение (по умолчанию серый)",
          ui: {
            // @ts-ignore
            component: ColorPickerInput,
          },
        },
      ],
    },
  ],
};
