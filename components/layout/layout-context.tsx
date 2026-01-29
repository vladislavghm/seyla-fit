"use client";
import React, { useState, useContext } from "react";
import {
  GlobalQuery,
  HeaderQuery,
  FooterQuery,
} from "../../tina/__generated__/types";

interface LayoutState {
  theme: GlobalQuery["global"]["theme"];
  header: HeaderQuery["header"];
  footer: FooterQuery["footer"];
  pageData: {};
  setPageData: React.Dispatch<React.SetStateAction<{}>>;
  /** Вкл — на / заглушка, логотип ведёт на /home */
  showComingSoonStub?: boolean;
}

const LayoutContext = React.createContext<LayoutState | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  return (
    context || {
      theme: {
        color: "blue",
        darkMode: "light",
        font: "sans",
      },
      header: undefined,
      footer: undefined,
      pageData: undefined,
      showComingSoonStub: false,
    }
  );
};

interface LayoutProviderProps {
  children: React.ReactNode;
  theme: GlobalQuery["global"]["theme"];
  header: HeaderQuery["header"];
  footer: FooterQuery["footer"];
  pageData: {};
  showComingSoonStub?: boolean;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  theme: initialTheme,
  header: initialHeader,
  footer: initialFooter,
  pageData: initialPageData,
  showComingSoonStub = false,
}) => {
  const [pageData, setPageData] = useState<{}>(initialPageData);

  return (
    <LayoutContext.Provider
      value={{
        theme: initialTheme,
        header: initialHeader,
        footer: initialFooter,
        pageData,
        setPageData,
        showComingSoonStub,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
