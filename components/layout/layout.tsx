import React, { PropsWithChildren } from "react";
import { LayoutProvider } from "./layout-context";
import client from "../../tina/__generated__/client";
import { Header } from "./nav/header";
import { Footer } from "./nav/footer";
import { PageLoader } from "./page-loader";

type LayoutProps = PropsWithChildren & {
  rawPageData?: any;
};

export default async function Layout({ children, rawPageData }: LayoutProps) {
  const [globalData, headerData, footerData] = await Promise.all([
    client.queries.global({
      relativePath: "index.json",
    }),
    client.queries.header({
      relativePath: "index.json",
    }),
    client.queries.footer({
      relativePath: "index.json",
    }),
  ]);

  return (
    <LayoutProvider
      theme={globalData.data.global.theme}
      header={headerData.data.header}
      footer={footerData.data.footer}
      pageData={rawPageData}
    >
      <PageLoader />
      <Header />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
    </LayoutProvider>
  );
}
