import Footer from "@/components/Footer";
import PaletteGen from "@/components/PaletteGen";

export default function Page() {
  return (
    <div className="flex flex-col">
      <PaletteGen />
      <Footer />
    </div>
  );
}
