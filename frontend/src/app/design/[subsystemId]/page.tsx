import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubsystem } from "@/data/subsystems";
import SubsystemOverview from "./SubsystemOverview";

export default async function SubsystemPage({
  params,
}: {
  params: Promise<{ subsystemId: string }>;
}) {
  const { subsystemId } = await params;
  const subsystem = getSubsystem(subsystemId);

  if (!subsystem) notFound();

  if (!subsystem.interactive) {
    return (
      <main
        className="relative h-dvh w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: "#000" }}
      >
        <div className="absolute top-0 left-0 p-4 pt-12">
          <Link
            href="/design"
            className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
            style={{ background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.35)", backdropFilter: "blur(10px)", color: "#00ff41" }}
          >
            <span aria-hidden="true">‹</span>
            <span>Back to Design</span>
          </Link>
        </div>
        <div
          className="mx-auto max-w-md w-full rounded-2xl p-8 text-center mx-6"
          style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", backdropFilter: "blur(10px)" }}
        >
          <p className="text-4xl mb-4" aria-hidden="true">🔩</p>
          <h1 className="text-xl font-semibold mb-2" style={{ color: "#00ff41" }}>{subsystem.label}</h1>
          <p className="text-sm" style={{ color: "rgba(0,255,65,0.55)" }}>Coming soon.</p>
        </div>
      </main>
    );
  }

  return <SubsystemOverview subsystem={subsystem} />;
}
