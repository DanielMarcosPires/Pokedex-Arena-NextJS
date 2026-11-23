import Link from "next/link";
import Nav from "./Mod/Mod";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";

interface HeaderProps {
  type?: string;
  secondaryType?: string;
}

export default function Header({ type = "grass", secondaryType="poison" }: HeaderProps) {
  const primaryStyle = TYPE_STYLES[type.toLowerCase()] ?? DEFAULT_STYLE;
  const secStyle = secondaryType
    ? (TYPE_STYLES[secondaryType.toLowerCase()] ?? DEFAULT_STYLE)
    : null;

  const backgroundImage = secStyle
    ? `linear-gradient(90deg, ${primaryStyle.gradientHex}33, ${secStyle.gradientHex}33)`
    : undefined;

  return (
    <header
      className={`text-2xl flex items-center justify-between shadow-black shadow-2xl  px-8 ${primaryStyle.cardBg}`}
      style={{
        borderBottomColor: secStyle
          ? secStyle.gradientHex
          : primaryStyle.gradientHex,
        backgroundImage,
      }}
    >
      <h2 className="py-4 font-semibold whitespace-nowrap">PokeArena</h2>
      <Nav className="flex items-center space-x-4">
        <Link className="py-4 hover:underline whitespace-nowrap shrink-0" href="/">
          Battle
        </Link>
        <Link className="py-4 hover:underline whitespace-nowrap shrink-0" href="/">
          Game
        </Link>
        <Link className="py-4 hover:underline whitespace-nowrap shrink-0" href="/about">
          About
        </Link>
      </Nav>
    </header>
  );
}