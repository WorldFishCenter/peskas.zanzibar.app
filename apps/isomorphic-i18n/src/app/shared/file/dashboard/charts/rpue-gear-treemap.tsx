import GearTreemap from "./gear-treemap";

export default function RpueGearTreemap({
  className,
}: {
  className?: string;
  lang?: string;
}) {
  return <GearTreemap metric="rpue" className={className} />;
}
