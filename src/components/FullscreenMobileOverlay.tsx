import { useGameState } from "@/lib/stores";

export function FullscreenMobileOverlay() {
  const { isFullscreenMobileOverlayOpen } = useGameState();

  if (!isFullscreenMobileOverlayOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6">
      <style>{`
        @font-face {
          font-family: 'T-Star TW Medium';
          src: url('./public/fonts/T-StarTW-Medium.woff2') format('woff2');
          font-weight: 500;
          font-style: normal;
          font-display: block;
        }
        
        .fullscreen-mobile-overlay {
          font-family: 'T-Star TW Medium', 'Arial', sans-serif !important;
          font-weight: 500;
          font-size: 32px;
          letter-spacing: 0.05em;
        }
        
        .fullscreen-mobile-overlay h1 {
          font-family: 'T-Star TW Medium', 'Arial', sans-serif !important;
          font-weight: 500;
        }
        
        .fullscreen-mobile-overlay p {
          font-family: 'T-Star TW Medium', 'Arial', sans-serif !important;
          font-weight: 500;
        }
      `}</style>
      
      <div className="fullscreen-mobile-overlay text-center max-w-sm space-y-12">
        {/* Main heading */}
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-[#55fc27] leading-tight tracking-wide">
            A Kind of Art
          </h1>
          <div className="w-12 h-1 bg-[#55fc27] mx-auto"></div>
        </div>

        {/* Info text */}
        <p className="text-lg text-[#55fc27] leading-relaxed tracking-wide">
          Diese Anwendung ist für Desktop-Geräte optimiert.
        </p>

        {/* Bottom accent line */}
        <div className="flex justify-center pt-6">
          <div className="w-12 h-1 bg-[#55fc27]"></div>
        </div>
      </div>
    </div>
  );
}
