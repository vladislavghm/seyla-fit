import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import PostClientPage from "./client-page";

// Отключаем статическую генерацию - страница будет генерироваться динамически
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostPage({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}) {
  const resolvedParams = await params;
  const filepath = resolvedParams.urlSegments.join("/");
  const data = await client.queries.post({
    relativePath: `${filepath}.mdx`,
  });

  return (
    <Layout rawPageData={data}>
      <PostClientPage {...data} />
    </Layout>
  );
}

export async function generateStaticParams() {
  try {
    let posts = await client.queries.postConnection();
    const allPosts = posts;

    if (!allPosts.data.postConnection.edges) {
      return [];
    }

    while (posts.data?.postConnection.pageInfo.hasNextPage) {
      posts = await client.queries.postConnection({
        after: posts.data.postConnection.pageInfo.endCursor,
      });

      if (!posts.data.postConnection.edges) {
        break;
      }

      allPosts.data.postConnection.edges.push(
        ...posts.data.postConnection.edges
      );
    }

    const params =
      allPosts.data?.postConnection.edges.map((edge) => ({
        urlSegments: edge?.node?._sys.breadcrumbs,
      })) || [];

    return params;
  } catch (error) {
    // Если TinaCMS недоступен при сборке, возвращаем пустой массив
    // Страницы будут генерироваться динамически
    console.warn(
      "TinaCMS недоступен при generateStaticParams, используем динамическую генерацию:",
      error
    );
    return [];
  }
}
