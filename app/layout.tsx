import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "客制化键盘制作系统 V2",
  description: "键盘配置、部件导入、兼容性检测、3D 预览与网页驱动配置原型",
};

const navItems = [
  { href: "/search", label: "搜索导入" },
  { href: "/parts", label: "部件库" },
  { href: "/build", label: "配置保存" },
  { href: "/driver", label: "驱动配置" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#F5F3EE] text-ink">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <Link className="text-lg font-bold text-ink" href="/build">
              客制化键盘制作系统 V2
            </Link>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item, index) => (
                <Link
                  className="rounded-md border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-ink hover:text-ink"
                  href={item.href}
                  key={`nav-${item.href}-${index}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
