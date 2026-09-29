import logo from "@/assets/XY.png";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const width = compact ? 46 : 72;
  return (
    <img
      src={logo.src}
      alt="Xingyu"
      width={width}
      height={Math.round((width * logo.height) / logo.width)}
      style={{
        display: "block",
        objectFit: "contain",
        margin: compact ? 0 : "0 auto",
      }}
    />
  );
}
