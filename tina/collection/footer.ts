import type { Collection } from "tinacms";
import { ColorPickerInput } from "../fields/colorPicker";

const Footer: Collection = {
  label: "Подвал",
  name: "footer",
  path: "content/global/footer",
  format: "json",
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
      label: "Цвет фона",
      name: "backgroundColor",
      description: "Цвет фона подвала",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "string",
      label: "Копирайт (первая строка)",
      name: "copyrightLine1",
      description: "Например: '© 2023 Студия растяжки'",
    },
    {
      type: "string",
      label: "Копирайт (вторая строка)",
      name: "copyrightLine2",
      description: "Например: 'и фитнеса \"Шпагат Просто\"'",
    },
  ],
};

export default Footer;

