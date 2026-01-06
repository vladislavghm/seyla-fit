import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import ClientPage from "@/components/blocks/client-page";

// Отключаем статическую генерацию - страница будет генерироваться динамически
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  try {
    const data = await client.queries.page({
      relativePath: `home.mdx`,
    });

    return (
      <Layout rawPageData={data}>
        <ClientPage {...data} />
      </Layout>
    );
  } catch (error) {
    // Если TinaCMS недоступен, возвращаем пустую страницу
    console.warn(
      "TinaCMS недоступен, используем пустую страницу:",
      error instanceof Error ? error.message : error
    );

    const emptyData = {
      data: {
        page: {
          __typename: "Page" as const,
          id: "",
          title: "",
          _sys: {
            __typename: "SystemInfo" as const,
            filename: "home.mdx",
            basename: "home.mdx",
            breadcrumbs: [],
            path: "home.mdx",
            relativePath: "home.mdx",
            extension: ".mdx",
          },
          blocks: [],
        },
      },
      variables: {
        relativePath: "home.mdx",
      },
      query: "",
    };

    return (
      <Layout rawPageData={null}>
        <ClientPage {...emptyData} />
      </Layout>
    );
  }
}
