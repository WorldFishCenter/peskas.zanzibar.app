import cn from "@utils/class-names";
import React, { useState } from "react";
import { VscSettings, VscChromeClose } from "react-icons/vsc";

interface InfoPanelProps {
  accidents: number;
  radius: number;
  onRadiusChange: (value: number) => void;
  radiusMin: number;
  radiusMax: number;
  radiusStep: number;
  selectedGears: string[];
  onGearChange: (gear: string) => void;
  gears: string[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  accidents,
  radius,
  onRadiusChange,
  radiusMin,
  radiusMax,
  radiusStep,
  selectedGears,
  onGearChange,
  gears,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg w-72 h-[505px] transition-[height,width] duration-200 overflow-hidden",
        { "h-14 w-[57px] ": !open }
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={cn("flex flex-wrap justify-end flex-row", {
          "flex-row-reverse": !open,
        })}
      >
        <VscSettings
          className={cn(
            "h-[25px] w-[25px] transition-all duration-400 ease-in opacity-100",
            {
              "opacity-0 hidden": open,
            }
          )}
        />
        <h2 className="text-xl font-bold mb-2 mt-3">
          Timor-Leste Fishing Tracks
        </h2>
      </div>
      <p className="mb-2">Predicted fishing tracks in Timor-Leste</p>
      <p className="mb-4">
        The layer aggregates data within the boundary of each hexagon cell
      </p>

      <div className="flex items-center mb-2">
        <div className="w-full bg-gradient-to-r from-blue-300 via-green-300 to-red-300 h-4 rounded"></div>
      </div>
      <p className="mb-4 text-sm">
        Fewer Tracks <span className="float-right">More Tracks</span>
      </p>

      <p className="mb-2">
        Data source:{" "}
        <a
          href="https://github.com/WorldFishCenter/datatest"
          className="text-blue-500"
        >
          WorldFishCenter
        </a>
      </p>

      <h3 className="text-2xl font-bold mb-4">
        TRACKS: {accidents.toLocaleString()}
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Gear</label>
        <div className="flex flex-wrap">
          {gears.map((g) => (
            <div key={g} className="flex items-center mr-4 mb-2">
              <input
                type="checkbox"
                value={g}
                checked={selectedGears.includes(g)}
                onChange={() => onGearChange(g)}
                className="mr-2"
              />
              <label onClick={() => onGearChange(g)}>{g}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Radius (meters)
        </label>
        <input
          type="range"
          min={radiusMin}
          max={radiusMax}
          step={radiusStep}
          value={radius}
          onChange={(e) => onRadiusChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600">
          {Array.from(
            { length: (radiusMax - radiusMin) / radiusStep + 1 },
            (_, i) => radiusMin + i * radiusStep
          ).map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
