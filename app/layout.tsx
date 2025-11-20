import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import OnboardingModal from "./components/OnboardingModal";
import { getOnboarded, getActiveMosqueId } from "./lib/auth";


export const metadata: Metadata = {
  title: "شبیکهون",
  description: "سامانه مسجد - نسخه اولیه",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const onboarded = await getOnboarded();
  const active = await getActiveMosqueId();
  const showHelp = !onboarded && !active;
  return (
    <html lang="fa" dir="rtl">
      <head />
      <body className={`antialiased pb-20`}>
        <OnboardingModal showInitially={showHelp} />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
