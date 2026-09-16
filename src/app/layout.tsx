import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      <body className="bg-background font-body-md text-body-md text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
