import React from "react";
import { notFound } from "next/navigation";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import { Section } from "@/components/layout/section";
import ClientPage from "./client-page";

// Отключаем статическую генерацию - страница будет генерироваться динамически
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}) {
  const resolvedParams = await params;
  const filepath = resolvedParams.urlSegments.join("/");

  // Исключаем путь admin из обработки TinaCMS
  if (filepath === "admin" || filepath.startsWith("admin/")) {
    notFound();
  }

  let data;
  try {
    data = await client.queries.page({
      relativePath: `${filepath}.mdx`,
    });
  } catch (error) {
    notFound();
  }

  // Главная без Section — как на /, чтобы блоки (hero и т.д.) растягивались на всю ширину
  if (filepath === "home") {
    return (
      <Layout rawPageData={data}>
        <ClientPage {...data} />
      </Layout>
    );
  }

  return (
    <Layout rawPageData={data}>
      <Section>
        <ClientPage {...data} />
      </Section>
    </Layout>
  );
}

export async function generateStaticParams() {
  try {
    let pages = await client.queries.pageConnection();
    const allPages = pages;

    if (!allPages.data.pageConnection.edges) {
      return [];
    }

    while (pages.data.pageConnection.pageInfo.hasNextPage) {
      pages = await client.queries.pageConnection({
        after: pages.data.pageConnection.pageInfo.endCursor,
      });

      if (!pages.data.pageConnection.edges) {
        break;
      }

      allPages.data.pageConnection.edges.push(
        ...pages.data.pageConnection.edges,
      );
    }

    const params = allPages.data?.pageConnection.edges
      .map((edge) => ({
        urlSegments: edge?.node?._sys.breadcrumbs || [],
      }))
      .filter((x) => x.urlSegments.length >= 1)
      .filter((x) => !x.urlSegments.every((x) => x === "home")); // home отдаётся по /home, на / — заглушка

    params.push({ urlSegments: ["home"] });
    return params;
  } catch (error) {
    // Если TinaCMS недоступен при сборке, возвращаем пустой массив
    // Страницы будут генерироваться динамически
    console.warn(
      "TinaCMS недоступен при generateStaticParams, используем динамическую генерацию:",
      error,
    );
    return [];
  }
}
