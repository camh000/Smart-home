import { ImageResponse } from "next/og";

// Branded share card shown when the URL is pasted into iMessage / WhatsApp /
// Slack / email. Next auto-wires this into og:image (and twitter:image).
export const alt = "Smart Home — Woodhouse Road";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATS: [string, string][] = [
  ["7", "voice rooms"],
  ["13", "light zones"],
  ["3", "smart locks"],
  ["5", "build phases"],
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 84px",
          backgroundColor: "#faf7f2",
          backgroundImage:
            "linear-gradient(rgba(15,27,45,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,27,45,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#0f1b2d",
        }}
      >
        {/* eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#5a6478",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 13,
              height: 13,
              borderRadius: 9999,
              backgroundColor: "#b8543a",
            }}
          />
          <div style={{ display: "flex" }}>
            Working document · Home Assistant × Claude
          </div>
        </div>

        {/* title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
            }}
          >
            Smart home
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
            }}
          >
            <div style={{ display: "flex", color: "#b8543a", paddingRight: 22 }}>
              at
            </div>
            <div style={{ display: "flex" }}>Woodhouse Road</div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              maxWidth: 880,
              fontSize: 29,
              lineHeight: 1.4,
              color: "#2a3548",
            }}
          >
            A self-hosted replacement for Alexa — voice, lighting, locks, blinds
            and CCTV, with Claude wired into Home Assistant.
          </div>
        </div>

        {/* stats */}
        <div style={{ display: "flex", gap: "52px" }}>
          {STATS.map(([value, label]) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "baseline", gap: "11px" }}
            >
              <div
                style={{ display: "flex", fontSize: 46, fontWeight: 700, color: "#b8543a" }}
              >
                {value}
              </div>
              <div style={{ display: "flex", fontSize: 21, color: "#5a6478" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
