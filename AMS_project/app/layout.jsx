import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'AMS - Attendance Management System',
  description: 'Attendance Management System Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
