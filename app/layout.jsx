export const metadata = {
  title: "AceChem — Gen Chem Practice",
  description: "Expert-reviewed general chemistry practice problems with instant feedback and worked solutions.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#F6F8F6",
          color: "#1B2A3D",
        }}
      >
        {children}
      </body>
    </html>
  );
}
