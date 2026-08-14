import { config } from "../config";
import { ConfigProvider } from "../contexts/ConfigContext";

export const metadata = {
  title: config.event.fullName,
  description: `RSVP for ${config.organization.fullName} ${config.event.name}`,

  // title: "Islah Trust Eid-Ul-Adha 2026",
  // description: "RSVP for Islah Trust Eid-Ul-Adha Lunch & Family Gathering 2026",
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