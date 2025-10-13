// types/canvas-confetti.d.ts
// Déclaration de module pour "canvas-confetti"
// Corrige les erreurs TypeScript sur Vercel :
// "Could not find a declaration file for module 'canvas-confetti'"

declare module "canvas-confetti" {
  type ConfettiOptions = {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    scalar?: number;
  };

  type ConfettiFn = (opts?: ConfettiOptions) => void;

  const confetti: ConfettiFn;
  export default confetti;
}
