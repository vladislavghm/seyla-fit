import type { Template } from "tinacms";
import { tinaField } from "tinacms/dist/react";
import { PageBlocksStats } from "@/tina/__generated__/types";
import { Section, sectionBlockSchemaField } from "@/components/layout/section";

export const Stats = ({ data }: { data: PageBlocksStats }) => {
    return (
        <Section background={data.background!}>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <h2 className="text-4xl font-medium lg:text-5xl" data-tina-field={tinaField(data, 'title')}>{data.title}</h2>
                    <p data-tina-field={tinaField(data, 'description')}>{data.description}</p>
                </div>

                <div className="grid divide-y *:text-center md:grid-cols-3 md:divide-x md:divide-y-0">
                    {data.stats?.map((stat) => (
                        <div key={stat?.type} className="space-y-4 py-4">
                            <div className="text-5xl font-bold" data-tina-field={tinaField(stat, 'stat')}>{stat!.stat}</div>
                            <p data-tina-field={tinaField(stat, 'type')}>{stat!.type}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

export const statsBlockSchema: Template = {
    name: "stats",
    label: "Статистика",
    ui: {
        previewSrc: "/blocks/stats.png",
        defaultItem: {
            title: "Статистика в цифрах",
            description: "Система управления контентом с открытым исходным кодом, которая позволяет разработчикам создавать и управлять контентом для своих веб-сайтов и приложений.",
            stats: [
                {
                    stat: "12K",
                    type: "Звезд на GitHub",
                },
                {
                    stat: "11K",
                    type: "Активных пользователей",
                },
                {
                    stat: "22K",
                    type: "Приложений",
                },
            ],
        },
    },
    fields: [
        sectionBlockSchemaField as any,
        {
            type: "string",
            label: "Заголовок",
            name: "title",
        },
        {
            type: "string",
            label: "Описание",
            name: "description",
        },
        {
            type: "object",
            label: "Статистика",
            name: "stats",
            list: true,
            ui: {
                defaultItem: {
                    stat: "12K",
                    type: "Звезд на GitHub",
                },
                itemProps: (item) => {
                    return {
                        label: `${item.stat} ${item.type}`,
                    };
                },
            },
            fields: [
                {
                    type: "string",
                    label: "Значение",
                    name: "stat",
                },
                {
                    type: "string",
                    label: "Тип",
                    name: "type",
                },
            ],
        },
    ],
};