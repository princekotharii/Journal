import "@/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}
