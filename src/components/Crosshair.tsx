import { useGameState } from "@/lib/stores";

export function Crosshair() {
  const { isPaused } = useGameState();
  
  if (isPaused) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 select-none mix-blend-difference">
      <div className="absolute w-5 h-0.5 bg-white/80 -top-px -left-[10px]"></div>
      <div className="absolute w-0.5 h-5 bg-white/80 -top-[10px] -left-px"></div>
    </div>
  );
}
