type Sprite = { rows: string[]; palette: Record<string, string> };

const K = "#000000";

export const SPRITES = {
  heart: {
    rows: [
      "..KKK.KKK..",
      ".KRRRKRRRK.",
      "KRWWRRRRRRK",
      "KRWRRRRRRRK",
      "KRRRRRRRRDK",
      ".KRRRRRRDK.",
      "..KRRRRDK..",
      "...KRRDK...",
      "....KDK....",
      ".....K.....",
    ],
    palette: { K, R: "#ff3b5c", D: "#c81e45", W: "#ffffff" },
  },
  pinkHeart: {
    rows: [
      "..KKK.KKK..",
      ".KPPPKPPPK.",
      "KPWWPPWPPPK",
      "KPWPPWPPWPK",
      "KPPWPPWPPDK",
      ".KPPWPPWDK.",
      "..KPPWPDK..",
      "...KPPDK...",
      "....KDK....",
      ".....K.....",
    ],
    palette: { K, P: "#ffb3c8", D: "#ff7aa2", W: "#ffffff" },
  },
  coin: {
    rows: [
      "..KKKKKK..",
      ".KYYYYYYK.",
      "KYWYYAYYOK",
      "KYWYAYAYOK",
      "KYYYAAAYOK",
      "KYYAYYYAOK",
      "KYYAYYYAOK",
      ".KYYYYYOK.",
      "..KKKKKK..",
    ],
    palette: { K, Y: "#ffc53d", W: "#fff4c2", O: "#e08e00", A: "#9a5b00" },
  },
  star: {
    rows: [
      "....K....",
      "...KYK...",
      "...KYK...",
      "KKKYYYKKK",
      ".KYYWYYK.",
      "..KYYYK..",
      ".KYYKYYK.",
      ".KYK.KYK.",
      ".KK...KK.",
    ],
    palette: { K, Y: "#ffd23f", W: "#fff7cc" },
  },
  bag: {
    rows: [
      "...KKKK...",
      "..K....K..",
      "..K....K..",
      "KKKKKKKKKK",
      "KBBBBBBBBK",
      "KBWBBBBBBK",
      "KBBBBBBBBK",
      "KBBBBBBBBK",
      "KBBBBBBBDK",
      "KBBBBBBDDK",
      "KKKKKKKKKK",
    ],
    palette: { K, B: "#2f6bff", W: "#9bb8ff", D: "#1e4fd8" },
  },
  envelope: {
    rows: [
      "KKKKKKKKKKK",
      "KKCCCCCCCKK",
      "KCKCCCCCKCK",
      "KCCKCRCKCCK",
      "KCCCKRKCCCK",
      "KCCCCKCCCCK",
      "KCCCCCCCCCK",
      "KKKKKKKKKKK",
    ],
    palette: { K, C: "#fff1d0", R: "#ff3b5c" },
  },
  ghost: {
    rows: [
      "....KKKK....",
      "..KKWWWWKK..",
      ".KWWWWWWWWK.",
      ".KWWKWWKWWK.",
      "KWWWKWWKWWWK",
      "KWWWWWWWWWWK",
      "KWPPWWWWPPWK",
      "KWWWWKKWWWWK",
      "KWWWWWWWWWWK",
      "KWWWWWWWWWWK",
      "K.KK.KK.KK.K",
    ],
    palette: { K, W: "#ffffff", P: "#ffc2d1" },
  },
  bat: {
    rows: [
      "K.....K.K.....K",
      "KK....KKK....KK",
      "KKK..KKKKK..KKK",
      "KKKKKKWKWKKKKKK",
      "KKKKKKKKKKKKKKK",
      ".KKK.KKKKK.KKK.",
      "..K...KKK...K..",
      ".......K.......",
    ],
    palette: { K: "#111114", W: "#ffffff" },
  },
  sparkle: {
    rows: ["...K...", "...K...", "..KKK..", "KKKKKKK", "..KKK..", "...K...", "...K..."],
    palette: { K: "#2f6bff" },
  },
} satisfies Record<string, Sprite>;

export type SpriteName = keyof typeof SPRITES;

export function PixelArt({
  sprite,
  scale = 4,
  className,
  title,
}: {
  sprite: SpriteName | Sprite;
  scale?: number;
  className?: string;
  title?: string;
}) {
  const s: Sprite = typeof sprite === "string" ? SPRITES[sprite] : sprite;
  const height = s.rows.length;
  const width = Math.max(...s.rows.map((r) => r.length));

  // Merge horizontal runs of the same colour into one rect.
  const rects: Array<{ x: number; y: number; w: number; fill: string }> = [];
  s.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const fill = s.palette[ch];
      if (!fill) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      rects.push({ x, y, w: end - x, fill });
      x = end;
    }
  });

  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}
