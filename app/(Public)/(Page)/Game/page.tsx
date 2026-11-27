import { GameCanvas } from "@/app/_components/Game/GameCanvas";

export default function GamePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GameCanvas />
    </main>
  );
}