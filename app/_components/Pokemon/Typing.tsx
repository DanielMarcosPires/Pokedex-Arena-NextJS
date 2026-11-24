import React, { ReactNode } from "react";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";

interface TypeProps {
  children: ReactNode;
  text: string;
}

export default function Typing({ children, text }: TypeProps) {
  const normalizedType = text.toLowerCase().trim();
  const typeStyle = TYPE_STYLES[normalizedType] ?? DEFAULT_STYLE;

  return (
    <li
      className={`flex-1 px-5 py-1 rounded-full text-lg font-medium ${typeStyle.badge}`}
    >
      {children}
    </li>
  );
}