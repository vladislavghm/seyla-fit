import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import ClientPage from "@/components/blocks/client-page";

// Отключаем статическую генерацию - страница будет генерироваться динамически
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const data = await client.queries.page({
    relativePath: `home.mdx`,
  });

  return (
    <Layout rawPageData={data}>
      <ClientPage {...data} />
    </Layout>
  );
}
