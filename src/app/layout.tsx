import type { Metadata } from "next";
import { siteFontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "유앤파트너스",
  description: "유앤파트너스 법률사무소",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${siteFontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
