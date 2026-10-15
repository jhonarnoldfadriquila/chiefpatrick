import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Chef Patrick's Kitchen" },
  robots: { index: false, follow: false },
};

// The admin has none of the public site's chrome (no preloader, smooth scroll or custom cursor).
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-adm-bg text-adm-text">{children}</div>;
}
