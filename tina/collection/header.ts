import type { Collection } from "tinacms";
import { iconSchema } from "../fields/icon";
import { ColorPickerInput } from "../fields/colorPicker";

const Header: Collection = {
  label: "Шапка",
  name: "header",
  path: "content/global/header",
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
      description: "Цвет фона шапки",
      ui: {
        // @ts-ignore
        component: ColorPickerInput,
      },
    },
    {
      type: "image",
      label: "Логотип",
      name: "logo",
      description: "Логотип (изображение)",
      // @ts-ignore
      uploadDir: () => "header",
    },
    {
      type: "string",
      label: "Телефон",
      name: "phone",
      description: "Номер телефона (например, '+7 (988) 510 08 80')",
    },
    {
      type: "object",
      label: "Навигация",
      name: "nav",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.label };
        },
        defaultItem: {
          href: "home",
          label: "Home",
        },
      },
      fields: [
        {
          type: "string",
          label: "Ссылка",
          name: "href",
        },
        {
          type: "string",
          label: "Название",
          name: "label",
        },
      ],
    },
    {
      type: "object",
      label: "Социальные сети",
      name: "social",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.icon?.name || "undefined" };
        },
      },
      fields: [
        iconSchema as any,
        {
          type: "string",
          label: "Ссылка",
          name: "url",
        },
      ],
    },
  ],
};

export default Header;

