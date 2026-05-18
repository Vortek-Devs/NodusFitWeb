import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = "Nodus Fit - plataforma para personal trainers";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #0A0F0D 0%, #10231D 62%, #0A0F0D 100%)",
        color: "#E8FBF5",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: "24px",
          marginBottom: "56px",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#3DD9A4",
            borderRadius: "28px",
            color: "#04342C",
            display: "flex",
            fontSize: "34px",
            fontWeight: 900,
            height: "88px",
            justifyContent: "center",
            width: "88px",
          }}
        >
          NF
        </div>
        <div style={{ display: "flex", fontSize: "46px", fontWeight: 900 }}>
          NODUS <span style={{ color: "#3DD9A4", marginLeft: "12px" }}>FIT</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: "74px",
          fontWeight: 900,
          letterSpacing: "-2px",
          lineHeight: 1.05,
          maxWidth: "940px",
          textAlign: "center",
        }}
      >
        Gestão de alunos, treinos e financeiro para personal trainers
      </div>
      <div
        style={{
          color: "#96CCBC",
          display: "flex",
          fontSize: "28px",
          lineHeight: 1.45,
          marginTop: "36px",
          maxWidth: "820px",
          textAlign: "center",
        }}
      >
        {siteConfig.description}
      </div>
    </div>,
    size,
  );
}
