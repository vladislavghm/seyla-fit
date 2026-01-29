import React from "react";
import { headers } from "next/headers";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import ClientPage from "@/components/blocks/client-page";
import { ComingSoon } from "@/components/coming-soon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const referer = (await headers()).get("referer") ?? "";
  const isFromAdmin = referer.includes("/admin");
  const isPreview = params?.preview === "1";
  const isHomeParam = params?.home !== undefined;

  let showComingSoonOnRoot = false;
  try {
    const globalData = await client.queries.global({
      relativePath: "index.json",
    });
    showComingSoonOnRoot = globalData.data.global.showComingSoonStub ?? false;
  } catch {
    // Tina недоступна — показываем обычную главную
  }

  if (showComingSoonOnRoot && !isFromAdmin && !isPreview && !isHomeParam) {
    return <ComingSoon />;
  }

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
      error instanceof Error ? error.message : error,
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
