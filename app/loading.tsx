export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050913] text-white">
      <div className="flex flex-col items-center gap-8">
        <img
          src="/boltlogo.png"
          alt="BoltPvP"
          className="h-36 w-36 animate-pulse object-contain drop-shadow-[0_0_35px_rgba(255,210,0,0.9)]"
        />

        <div className="h-2 w-80 overflow-hidden rounded-full bg-blue-950">
          <div className="h-full w-1/2 animate-[loadBar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-300" />
        </div>
      </div>

      <style>{`
        @keyframes loadBar {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(240%);
          }
        }
      `}</style>
    </main>
  );
}