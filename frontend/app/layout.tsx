import "@/app/globals.css";
import Providers from "./providers";

export const metadata = {
  title: "EasyMake MFU Clubs",
  description: "A club management platform for MFU students",
   icons: {
    icon: "/logo.ico", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
