import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Silo - On-Chain Firewall for Solana AI Agents',
  description: 'Every transaction your agent wants to make — analyzed by Claude before a single lamport moves.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body>{children}</body>
    </html>
  );
}