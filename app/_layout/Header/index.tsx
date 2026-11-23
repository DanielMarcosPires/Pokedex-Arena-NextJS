import Link from "next/link";
import Nav from "./Mod/Mod";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";

interface HeaderProps {
  type?: string;
}

export default function Header({ type = "fire" }: HeaderProps) {
  const primaryStyle = TYPE_STYLES[type.toLowerCase()] ?? DEFAULT_STYLE;

  return (
    <header
      className={`text-2xl flex justify-between shadow-black shadow-2xl border-b-8 px-8 ${primaryStyle.cardBg}`}
      style={{
        borderColor: primaryStyle.gradientHex,
      }}
    >
      <h2 className="py-4 font-semibold">PokeArena</h2>
      <Nav className="flex space-x-4">
        <Link className="w-full py-4 hover:underline" href="/">
          Battle
        </Link>
        <Link className="w-full py-4 hover:underline" href="/">
          Game
        </Link>
        <Link className="w-full py-4 hover:underline" href="/about">
          About
        </Link>
      </Nav>
    </header>
  );
}