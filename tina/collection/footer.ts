import type { Collection } from "tinacms";
import { iconSchema } from "../fields/icon";

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

export default Footer;

