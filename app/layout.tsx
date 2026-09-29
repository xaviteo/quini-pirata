import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/nav";
import "./globals.css";

const grotesk = localFont({
  src: "../fonts/SchibstedGrotesk.ttf",
  weight: "500 900",
  variable: "--font",
  display: "swap",
});

export const metadata: Metadata = {
  title: "quini.pirata.app",
  description: "Mesa privada del Quini 6. Boleta, histórico y aviso de premios.",
  robots: { index: false, follow: false },
};

const themeBoot = `(function(){try{var t=localStorage.getItem('quini-theme');if(t!=='day'&&t!=='night'){var h=new Date().getHours();t=(h>=20||h<7)?'night':'day'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={grotesk.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
