import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "Lead Portal",
    template: "%s · Lead Portal",
  },
  description: "Lead selling platform — capture, qualify, price and distribute leads.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
