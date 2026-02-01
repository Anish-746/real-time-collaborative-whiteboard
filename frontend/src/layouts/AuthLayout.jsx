import DoodleCanvas from "../components/DoodleCanvas";

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdfcf7]">
      {/* Background canvas */}
      <DoodleCanvas />

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}