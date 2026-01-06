import Layout from "@/components/layout/layout";
import client from "@/tina/__generated__/client";
import PostsClientPage from "./client-page";

// Отключаем статическую генерацию - страница будет генерироваться динамически
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostsPage() {
  try {
    let posts = await client.queries.postConnection({
      sort: "date",
      last: 1,
    });
    const allPosts = posts;

    if (!allPosts.data.postConnection.edges) {
      const emptyData = {
        postConnection: {
          edges: [],
          totalCount: 0,
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: false,
            startCursor: "",
            endCursor: "",
          },
        },
      };
      return (
        <Layout rawPageData={null}>
          <PostsClientPage data={emptyData} variables={{}} query="" />
        </Layout>
      );
    }

    while (posts.data?.postConnection.pageInfo.hasPreviousPage) {
      posts = await client.queries.postConnection({
        sort: "date",
        before: posts.data.postConnection.pageInfo.endCursor,
      });

      if (!posts.data.postConnection.edges) {
        break;
      }

      allPosts.data.postConnection.edges.push(
        ...posts.data.postConnection.edges.reverse()
      );
    }

    return (
      <Layout rawPageData={allPosts.data}>
        <PostsClientPage {...allPosts} />
      </Layout>
    );
  } catch (error) {
    // Если TinaCMS недоступен при сборке, возвращаем пустую страницу
    console.warn(
      "TinaCMS недоступен при сборке /posts, используем пустую страницу:",
      error
    );
    const emptyData = {
      postConnection: {
        edges: [],
        totalCount: 0,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: "",
          endCursor: "",
        },
      },
    };
    return (
      <Layout rawPageData={null}>
        <PostsClientPage data={emptyData} variables={{}} query="" />
      </Layout>
    );
  }
}
