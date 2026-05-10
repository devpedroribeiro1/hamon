import "./globals.css";

export const metadata = {
  title: "Hamon — Habit Monitor",
  description:
    "Gerencie seus hábitos com clareza. Organize, priorize e acompanhe seus hábitos com um panorama visual intuitivo.",
  keywords: ["habits", "productivity", "habit tracker", "habit monitor"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
