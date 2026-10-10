import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "Comfi | Premium Ultra Thin Sanitary Pads",
  description: "Gynecologist-approved, organic cotton sanitary pads engineered without bulkiness. Zero leaks. Zero irritation. Ultra-thin daytime and sleep protection.",
};

import MainLayout from "./components/MainLayout";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background-primary text-primaryText selection:bg-[#febac4] selection:text-[#7e0022]">
        <AppProvider>
          <Navbar />
          <MainLayout>
            {children}
          </MainLayout>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
