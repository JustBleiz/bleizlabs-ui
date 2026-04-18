import type { Metadata } from 'next';
import './playground.scss';
import { ThemeToggle } from './_components/ThemeToggle';

export const metadata: Metadata = {
  title: 'bleizlabs-ui — dev playground',
  description:
    'Internal development playground for the bleizlabs-ui component library.',
};

// Applies the saved theme synchronously before React hydrates so users
// never see a flash of the default theme on reload. The ThemeToggle
// component is the source of truth for the `bleizlabs-ui:theme` key.
const themeInitScript = `(function(){try{var t=localStorage.getItem('bleizlabs-ui:theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
