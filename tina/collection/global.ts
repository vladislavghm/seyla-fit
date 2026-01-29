import type { Collection } from "tinacms";
import { ColorPickerInput } from "../fields/color";

const Global: Collection = {
  label: "Глобальные настройки",
  name: "global",
  path: "content/global",
  format: "json",
  match: {
    include: "index",
  },
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      type: "string",
      label: "Название сайта",
      name: "title",
      description: "Отображается во вкладке браузера",
    },
    {
      type: "boolean",
      label: "Заглушка «Скоро открытие» на главной",
      name: "showComingSoonStub",
      description:
        "Вкл — на / показывается заглушка, полный сайт по /home и /?home. Выкл — обычная главная на /.",
    },
    {
      type: "object",
      label: "Тема",
      name: "theme",
      // @ts-ignore
      fields: [
        {
          type: "string",
          label: "Основной цвет",
          name: "color",
          ui: {
            // @ts-ignore
            component: ColorPickerInput,
          },
        },
        {
          type: "string",
          name: "font",
          label: "Семейство шрифтов",
          options: [
            {
              label: "System Sans",
              value: "sans",
            },
            {
              label: "Nunito",
              value: "nunito",
            },
            {
              label: "Lato",
              value: "lato",
            },
          ],
        },
        {
          type: "string",
          name: "darkMode",
          label: "Темный режим",
          options: [
            {
              label: "Системный",
              value: "system",
            },
            {
              label: "Светлый",
              value: "light",
            },
            {
              label: "Темный",
              value: "dark",
            },
          ],
        },
      ],
    },
  ],
};

export default Global;
