import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface HeaderInfo {
  title: string;
  subtitle?: string;
  userName?: string;
  streakCount?: number;
  userAvatar?: string;
}

interface HeaderContextType {
  header: HeaderInfo | null;
  setHeader: (header: HeaderInfo) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<HeaderInfo | null>(null);

  return (
    <HeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useSetPageHeader(headerInfo: HeaderInfo) {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useSetPageHeader must be used within HeaderProvider");
  }

  // Create a stable dependency key based on the header data (excluding callback)
  const headerKey = JSON.stringify({
    title: headerInfo.title,
    subtitle: headerInfo.subtitle,
    userName: headerInfo.userName,
    userAvatar: headerInfo.userAvatar,
    streakCount: headerInfo.streakCount,
  });

  useEffect(() => {
    context.setHeader(headerInfo);
  }, [headerKey]);
}

export function usePageHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within HeaderProvider");
  }
  return context.header;
}
