import Link from "next/link";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ subsystemId: string }>;
}) {
  const { subsystemId } = await params;

  return (
    <main
      className="relative h-dvh w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(to bottom, #87CEEB 0%, #d4eef7 60%, #f0f8ff 100%)",
      }}
    >
      <div className="absolute top-0 left-0 p-4 pt-12">
        <Link
          href={`/design/${subsystemId}`}
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium text-white"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)" }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back</span>
        </Link>
      </div>

      <div
        className="mx-auto max-w-md w-full rounded-2xl p-8 text-center mx-6"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)" }}
      >
        <p className="text-4xl mb-4" aria-hidden="true">📐</p>
        <h1 className="text-xl font-semibold text-white mb-2">Detail View</h1>
        <p className="text-sm text-white/70">Coming soon.</p>
      </div>
    </main>
  );
}
