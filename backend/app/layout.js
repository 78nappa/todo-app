// Root layout required by Next.js App Router
export const metadata = {
  title: 'TODO API',
  description: 'TODO App Backend API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
