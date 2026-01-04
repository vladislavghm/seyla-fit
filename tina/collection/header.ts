import type { Collection } from "tinacms";
import { iconSchema } from "../fields/icon";

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
      type: "image",
      label: "Logo",
      name: "logo",
      description: "Логотип (изображение)",
      // @ts-ignore
      uploadDir: () => "header",
    },
    {
      type: "string",
      label: "Name",
      name: "name",
      description: "Название (текст, если нет логотипа)",
    },
    {
      type: "string",
      label: "Subtitle",
      name: "subtitle",
      description: "Подзаголовок под названием (например, 'студия растяжки')",
    },
    {
      type: "string",
      label: "Phone",
      name: "phone",
      description: "Номер телефона (например, '+7 (988) 510 08 80')",
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Primary", value: "primary" },
      ],
    },
    {
      type: "object",
      label: "Nav Links",
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
          label: "Link",
          name: "href",
        },
        {
          type: "string",
          label: "Label",
          name: "label",
        },
      ],
    },
    {
      type: "object",
      label: "Social Links",
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
          label: "Url",
          name: "url",
        },
      ],
    },
  ],
};

export default Header;

