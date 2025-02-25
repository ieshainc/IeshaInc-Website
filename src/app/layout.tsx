import './globals.css';
import { Providers } from './providers';
import Header from './components/Header';
import Footer from './components/Footer';
import SessionManager from './components/SessionManager';

export const metadata = {
  title: 'YourSite - Your Business',
  description: 'Your business description here',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <SessionManager />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
