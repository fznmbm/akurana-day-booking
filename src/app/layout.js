import { config } from "../config";
import { ConfigProvider } from "../contexts/ConfigContext";

export const metadata = {
  title: "Akurana Day 2026 - All UK Akuranaites Grand Get Together",
  description: "Book your tickets for Akurana Day 2026 - All UK Akuranaites Grand Get Together. Saturday 26th September 2026, Claremont High School, Harrow. Organised by AHHC, AUF & AWA-UK.",
  keywords: "Akurana Day 2026, Akurana, AHHC, AUF, AWA-UK, Grand Get Together, Harrow, London",
  openGraph: {
    title: "Akurana Day 2026 - All UK Akuranaites Grand Get Together",
    description: "Book your tickets for Akurana Day 2026. Saturday 26th September 2026, Claremont High School, Harrow.",
    url: "https://akurana.elitestack.co.uk",
    siteName: "Akurana Day 2026",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
        `}</style>
      </head>
      <body>
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}