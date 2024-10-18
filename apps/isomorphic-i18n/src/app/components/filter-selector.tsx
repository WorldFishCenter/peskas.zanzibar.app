import { ActionIcon, Checkbox, Input, Popover } from "rizzui";
import { TbFilterCog } from "react-icons/tb";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { BmuType, useGlobalFilter } from "./global-filter-provider";
import Fuse from "fuse.js";

export const FilterSelector = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [filteredList, setFilteredList] = useState<BmuType[] | string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { bmuOriginalData, bmuFilter, setBmuFilter } = useGlobalFilter();

  const fuse = new Fuse(
    bmuOriginalData.flatMap((section) =>
      section.units.map((unit) => unit.value)
    ),
    {
      includeScore: true,
    }
  );

  useEffect(() => {
    setFilteredList(bmuOriginalData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value);
    if (e.target.value) {
      const result = fuse.search(e.target.value);
      setFilteredList(result.map((res) => res.item));
    } else {
      setFilteredList(bmuOriginalData);
    }
  };

  return (
    <Popover isOpen={isOpen} setIsOpen={setIsOpen} placement="bottom-end">
      <Popover.Trigger>
        <ActionIcon variant="text" className="relative">
          <TbFilterCog className="h-6 w-6 fill-[#D6D6D6] [stroke-width:1.5px]" />
        </ActionIcon>
      </Popover.Trigger>
      <Popover.Content className="w-[350px]">
        <Input
          placeholder="Search here..."
          value={searchFilter}
          onChange={handleSearchChange}
        />
        <div className="space-y-2 mt-4">
          {filteredList.map((section, idx) => {
            return (
              <FilterGroup
                key={`bmu-section-${idx}`}
                bmuSection={section}
                searchFilter={searchFilter}
              />
            );
          })}
        </div>
      </Popover.Content>
    </Popover>
  );
};

const FilterGroup = ({
  bmuSection,
  searchFilter,
}: {
  bmuSection: BmuType | string;
  searchFilter: string;
}) => {
  const { bmuFilter, setBmuFilter } = useGlobalFilter();

  const handleBmuSelect = (unit: string) => {
    if (bmuFilter.includes(unit)) {
      setBmuFilter(bmuFilter.filter((filter) => filter !== unit));
    } else {
      setBmuFilter([...bmuFilter, unit]);
    }
  };

  if (typeof bmuSection === "string" && searchFilter) {
    const unit = bmuSection as string;

    return (
      <Checkbox
        key={unit}
        label={unit}
        checked={bmuFilter.findIndex((filter) => filter === unit) !== -1}
        onChange={() => handleBmuSelect(unit)}
      />
    );
  } else {
    const section = bmuSection as BmuType;
    const allSelected = section.units.every((unit) => {
      return bmuFilter.includes(unit.value);
    });

    const handleSectionSelect = () => {
      if (allSelected) {
        setBmuFilter(
          bmuFilter.filter(
            (filter) =>
              !section.units.flatMap((unit) => unit.value).includes(filter)
          )
        );
      } else {
        setBmuFilter([
          ...bmuFilter,
          ...section.units.map((unit) => unit.value),
        ]);
      }
    };

    return (
      <div>
        <Checkbox
          label={section.sectionName}
          checked={allSelected}
          onChange={handleSectionSelect}
        />
        <div className="mt-2 ml-8 space-y-2">
          {section.units.map((unit) => {
            return (
              <Checkbox
                key={unit.value}
                label={unit.value}
                checked={
                  bmuFilter.findIndex((filter) => filter === unit.value) !== -1
                }
                onChange={() => handleBmuSelect(unit.value)}
              />
            );
          })}
        </div>
      </div>
    );
  }
};
