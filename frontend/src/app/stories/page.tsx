"use client";

import Link from "next/link";
import { useState } from "react";

const PANEL = { background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", backdropFilter: "blur(10px)" };
const BUTTON = { background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.35)", backdropFilter: "blur(10px)" };
const SUB_BUTTON = { background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.2)", backdropFilter: "blur(10px)" };

export default function StoriesPage() {
  const [engineersExpanded, setEngineersExpanded] = useState(false);

  return (
    <main
      className="relative h-dvh w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "#000" }}
    >
      <div className="absolute top-0 left-0 p-4 pt-12">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ ...BUTTON, color: "#00ff41" }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back</span>
        </Link>
      </div>

      <div className="mx-auto max-w-md w-full rounded-2xl p-8 flex flex-col gap-4 mx-6" style={PANEL}>
        <h1 className="text-center text-xl font-semibold mb-2" style={{ color: "#00ff41" }}>
          Choose a story
        </h1>

        <Link
          href="/stories/students"
          className="flex items-center justify-between rounded-xl px-5 py-4 text-base font-medium"
          style={BUTTON}
        >
          <span style={{ color: "#00ff41" }}>Students</span>
          <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
        </Link>

        <Link
          href="/stories/parents"
          className="flex items-center justify-between rounded-xl px-5 py-4 text-base font-medium"
          style={BUTTON}
        >
          <span style={{ color: "#00ff41" }}>Parents</span>
          <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
        </Link>

        <Link
          href="/stories/educators"
          className="flex items-center justify-between rounded-xl px-5 py-4 text-base font-medium"
          style={BUTTON}
        >
          <span style={{ color: "#00ff41" }}>Educators</span>
          <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
        </Link>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setEngineersExpanded((v) => !v)}
            className="flex items-center justify-between rounded-xl px-5 py-4 text-base font-medium w-full text-left"
            style={BUTTON}
          >
            <span style={{ color: "#00ff41" }}>Engineers &amp; Financiers</span>
            <span
              style={{ color: "rgba(0,255,65,0.5)", transition: "transform 0.2s", display: "inline-block", transform: engineersExpanded ? "rotate(90deg)" : "none" }}
              aria-hidden="true"
            >
              ›
            </span>
          </button>

          {engineersExpanded && (
            <div className="flex flex-col gap-2 pl-4">
              <Link
                href="/stories/engineers-community"
                className="flex items-center justify-between rounded-xl px-5 py-4 text-base font-medium"
                style={SUB_BUTTON}
              >
                <span style={{ color: "#00ff41" }}>Community Involvement</span>
                <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
              </Link>
              <Link
                href="/stories/engineers-built"
                className="flex items-center justify-between rounded-xl px-5 py-4 text-base font-medium"
                style={SUB_BUTTON}
              >
                <span style={{ color: "#00ff41" }}>How this was built</span>
                <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
