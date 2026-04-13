import type { Metadata } from 'next';
import '../styles/index.scss';

export const metadata: Metadata = {
  title: 'bleizlabs-ui — dev playground',
  description:
    'Internal development playground for the bleizlabs-ui component library.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
