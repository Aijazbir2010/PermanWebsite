import NextTopLoader from 'nextjs-toploader';
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Perman Website",
  description: "Created by Aijazbir",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body className="bg-[#080808] text-white">
          {/* Add the #root element directly in layout.js */}
          <div id="root">
            <NextTopLoader color='#2176FF' showSpinner={false}/>
            {children}
          </div>
        </body>
      </html>
  );
}
