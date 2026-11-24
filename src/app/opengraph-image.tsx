import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Evidence Reps — Every rep backed by evidence";

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
          background: "#121418",
          color: "#ffffff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, textTransform: "uppercase" }}>
          Evidence Reps
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: 1.05, fontWeight: 700 }}>
          <span>Every rep</span>
          <span style={{ color: "#8fa0ff" }}>backed by evidence.</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#cacdd3" }}>
          Acessórios de treino com critério
        </div>
      </div>
    ),
    size,
  );
}
