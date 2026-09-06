import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ระบบบันทึกเวลาปฏิบัติธรรมวิปัสสนากรรมฐาน",
  description: "ระบบบันทึกเวลาและติดตามการเข้าร่วมโครงการปฏิบัติธรรมวิปัสสนากรรมฐาน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
