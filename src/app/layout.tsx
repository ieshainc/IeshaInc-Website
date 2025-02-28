import './globals.css';
import { Providers } from './providers';
import Header from './components/Header';
import Footer from './components/Footer';
import SessionManager from './components/SessionManager';
import ClientOnly from './components/ClientOnly';
import AuthProfileManager from './components/AuthProfileManager';

export const metadata = {
  title: 'Iesha Inc.',
  description: 'Innovative Economic Solutions & Honest Accounting Inc.',
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
          <ClientOnly>
            <SessionManager />
            <AuthProfileManager />
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ClientOnly>
        </Providers>
      </body>
    </html>
  );
}
