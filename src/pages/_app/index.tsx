import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../../components/Header";
import { Hero } from "../../components/Hero";
import { Categories } from "../../components/Categories";
import { Gallery } from "../../components/Gallery";
import { Footer } from "../../components/Footer";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />

      <main className="py-10">
        <Hero />

        <Categories />

        <Gallery />
      </main>

      <Footer />
    </>
  );
}
