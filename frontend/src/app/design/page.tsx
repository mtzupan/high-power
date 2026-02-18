import Link from "next/link";

export default function DesignPage() {
  return (
    <main
      className="relative h-dvh w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(to bottom, #87CEEB 0%, #d4eef7 60%, #f0f8ff 100%)",
      }}
    >
      {/* Back button */}
      <div className="absolute top-0 left-0 p-4 pt-12">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium text-white"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)" }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back</span>
        </Link>
      </div>

      <div
        className="mx-auto max-w-md w-full rounded-2xl p-8 flex flex-col gap-4 mx-6"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)" }}
      >
        <h1 className="text-center text-xl font-semibold text-white mb-2">
          Choose a subsystem
        </h1>
        <Link
          href="/design/blades"
          className="flex items-center justify-between rounded-xl px-5 py-4 text-base font-medium text-white"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <span>Blades</span>
          <span className="opacity-60" aria-hidden="true">›</span>
        </Link>
        <Link
          href="/design/drivetrain"
          className="flex items-center justify-between rounded-xl px-5 py-4 text-base font-medium text-white"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <span>Drivetrain</span>
          <span className="opacity-60" aria-hidden="true">›</span>
        </Link>
      </div>
    </main>
  );
}
