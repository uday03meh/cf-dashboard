// app/layout.js
import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
export const metadata = {
  title: "Codeforces Dashboard",
  description: "A simple dashboard to view Codeforces user profile",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
