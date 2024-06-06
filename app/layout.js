// app/layout.js
import '../styles/globals.css';

export const metadata = {
  title: 'Codeforces Dashboard',
  description: 'A simple dashboard to view Codeforces user profile',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
