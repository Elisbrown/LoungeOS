
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { StaffProvider } from '@/context/staff-context';
import { LanguageProvider } from '@/context/language-context';
import { SettingsProvider, SettingsInitializer } from '@/context/settings-context';

export const metadata: Metadata = {
  title: 'LoungeOS',
  description: 'The complete management solution for your lounge.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <StaffProvider>
              <SettingsProvider>
                <SettingsInitializer />
                {children}
              </SettingsProvider>
            </StaffProvider>
          </AuthProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}

    