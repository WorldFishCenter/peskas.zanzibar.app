import GearTreemap from "./gear-treemap";

export default function CpueGearTreemap({
  className,
}: {
  className?: string;
  lang?: string;
}) {
  return <GearTreemap metric="cpue" className={className} />;
}
