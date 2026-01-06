import Link from "next/link";
import type { Template } from "tinacms";
import { tinaField } from "tinacms/dist/react";
import { Button } from "@/components/ui/button";
import { PageBlocksCta } from "@/tina/__generated__/types";
import { Icon } from "@/components/icon";
import { Section } from "@/components/layout/section";
import { iconSchema } from "@/tina/fields/icon";
import { normalizeIconData } from "@/lib/icon-utils";

export const CallToAction = ({ data }: { data: PageBlocksCta }) => {
  return (
    <Section>
      <div className="text-center">
        <h2
          className="text-balance text-4xl font-semibold lg:text-5xl"
          data-tina-field={tinaField(data, "title")}
        >
          {data.title}
        </h2>
        <p className="mt-4" data-tina-field={tinaField(data, "description")}>
          {data.description}
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {data.actions &&
            data.actions.map((action) => {
              const iconData = normalizeIconData(action?.icon);

              return (
                <div
                  key={action!.label}
                  data-tina-field={tinaField(action)}
                  className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                >
                  <Button
                    asChild
                    size="lg"
                    variant={action!.type === "link" ? "ghost" : "default"}
                    className="rounded-xl px-5 text-base"
                  >
                    <Link href={action!.link!}>
                      {iconData && <Icon data={iconData} />}
                      <span className="text-nowrap">{action!.label}</span>
                    </Link>
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
    </Section>
  );
};

export const ctaBlockSchema: Template = {
  name: "cta",
  label: "Призыв к действию",
  ui: {
    previewSrc: "/blocks/cta.png",
    defaultItem: {
      title: "Начните прямо сейчас",
      description:
        "Присоединяйтесь к нам сегодня и выведите управление контентом на новый уровень.",
      actions: [
        {
          label: "Начать",
          type: "button",
          link: "/",
        },
        {
          label: "Записаться на демо",
          type: "link",
          link: "/",
        },
      ],
    },
  },
  fields: [
    {
      type: "string",
      label: "Заголовок",
      name: "title",
    },
    {
      type: "string",
      label: "Описание",
      name: "description",
      ui: {
        component: "textarea",
      },
    },
    {
      label: "Действия",
      name: "actions",
      type: "object",
      list: true,
      ui: {
        defaultItem: {
          label: "Текст кнопки",
          type: "button",
          icon: {
            name: "Tina",
            color: "white",
            style: "float",
          },
          link: "/",
        },
        itemProps: (item) => ({ label: item.label }),
      },
      fields: [
        {
          label: "Текст",
          name: "label",
          type: "string",
        },
        {
          label: "Тип",
          name: "type",
          type: "string",
          options: [
            { label: "Кнопка", value: "button" },
            { label: "Ссылка", value: "link" },
          ],
        },
        iconSchema as any,
        {
          label: "Ссылка",
          name: "link",
          type: "string",
        },
      ],
    },
  ],
};
