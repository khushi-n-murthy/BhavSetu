import { ImageResponse } from "next/og";

export const alt = "BhavSetu: AI agents that help small factories buy right and quote right";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#10213f",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: "#10213f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700 }}>
            B
          </div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>BhavSetu</div>
          <div style={{ marginLeft: "auto", background: "#e3f3ef", color: "#0a5f52", borderRadius: 999, padding: "10px 22px", fontSize: 24, fontWeight: 600 }}>
            Tech4Bharat 2026 · Problem 4.1 · Agentic AI
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>Small factories that buy right and quote right.</div>
          <div style={{ fontSize: 30, marginTop: 24, color: "#2b3b58", lineHeight: 1.35 }}>
            AI agents on WhatsApp that pick the best supplier for each order and block any quote below cost. The owner approves every rupee.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24 }}>
          <div style={{ background: "#0e7c6b", color: "#fff", borderRadius: 999, padding: "12px 26px", fontWeight: 600 }}>Try a purchase</div>
          <div style={{ border: "2px solid #10213f", borderRadius: 999, padding: "10px 24px", fontWeight: 600 }}>Kannada · Hindi · English</div>
        </div>
      </div>
    ),
    size,
  );
}
