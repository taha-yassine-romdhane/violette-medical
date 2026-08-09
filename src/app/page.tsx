import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Products from "@/components/Products";
import Partnership from "@/components/Partnership";
import Process from "@/components/Process";
import Catalogue from "@/components/Catalogue";
import Events from "@/components/Events";
import Faq from "@/components/Faq";
import CtaBand from "@/components/CtaBand";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Products />
        <Partnership />
        <Process />
        <Catalogue />
        <Events />
        <Faq />
        <Contact />
        <CtaBand />
      </main>
      <Footer overlap />
    </>
  );
}
