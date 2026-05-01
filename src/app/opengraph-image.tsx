import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Kaspa — Real-time Decentralization";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADING_SIZE = 140;
const SUB_SIZE = Math.round(HEADING_SIZE * (28 / 96)); // matches homepage ratio
const PADDING_LEFT = 72;
const PADDING_TOP = 100;
const fontDirectory = join(process.cwd(), "src", "app", "fonts");

export default async function OG() {
  const [geistBold, geistRegular] = await Promise.all([
    readFile(join(fontDirectory, "Geist-Bold.ttf")),
    readFile(join(fontDirectory, "Geist-Regular.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#f5f5f7",
        padding: `${PADDING_TOP}px ${PADDING_LEFT}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: HEADING_SIZE,
            fontFamily: "Geist",
            fontWeight: 700,
            color: "#1a1a1e",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
          }}
        >
          Real-time
        </div>
        <div
          style={{
            fontSize: HEADING_SIZE,
            fontFamily: "Geist",
            fontWeight: 700,
            color: "#1a1a1e",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
          }}
        >
          Decentralization
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
          fontSize: SUB_SIZE,
          fontFamily: "Geist",
          fontWeight: 400,
          color: "rgba(26, 26, 30, 0.65)",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          marginTop: 40,
          marginLeft: 5,
        }}
      >
        <span>{"bitcoin\u2019s"}</span>
        <span style={{ marginLeft: 9 }}>proof-of-work</span>
        <span style={{ marginLeft: 4 }}>without</span>
        <span style={{ marginLeft: 9 }}>the</span>
        <span style={{ marginLeft: 9 }}>wait.</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistBold, weight: 700, style: "normal" },
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
      ],
    },
  );
}
