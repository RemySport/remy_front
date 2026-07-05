import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "레미스포츠",
  description: "REMY Performance Soccer - 우리 팀 경기 티켓 예약 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-[#E8E8E8]">
        <div className="relative mx-auto min-h-dvh w-full max-w-[402px] bg-white shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
