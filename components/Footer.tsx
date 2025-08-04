import { spaceGrotesk, jetbrainsMono, rubik } from "@/app/fonts";

export default function Footer() {
  return (
    <footer className="border-t-2 border-gray-300 bg-[#000000] p-6">
      <div className="text-center">
        <p className={`${jetbrainsMono.className} text-[0.6rem] font-bold tracking-wider`}>
          Made By{' '}
          <a 
            href="https://github.com/srummanf/image-palette" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-2 hover:text-red-500 transition-colors  duration-200 px-1"
          >
            srummanf
          </a>
        </p>
      </div>
    </footer>
  );
}