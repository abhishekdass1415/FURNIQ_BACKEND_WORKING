import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your products and inventory',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/*
          The Providers have been removed because they are no longer needed.
          Every page now fetches its own data from your API.
          This is the final and correct setup for deploying to Vercel without errors.
        */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}

