import GameCanvas from "@/app/_components/Game/GameCanvas";

export default function GamePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GameCanvas width={640} height={400} />
    </main>
  );
}