"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronDownIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

import { Button } from "@ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@ui/command";
import { FormField, FormItem } from "@ui/form2";
import { cn } from "@ui/index";
import { Label } from "@ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";

const MIN_WIDTH = 300;

interface Option {
  value: string;
  label: string;
}

interface VirtualizedCommandProps {
  options: Option[];
  label?: string;
  placeholder: string;
  selectedOptions: Option[];
  onSelectOption?: (option: Option) => void;
  onClear?: () => void;
}

const VirtualizedCommand = ({
  options,
  label,
  placeholder,
  selectedOptions,
  onSelectOption,
  onClear,
}: VirtualizedCommandProps) => {
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const parentRef = useRef(null);

  const sortedFilteredOptions = useMemo(() => {
    return filteredOptions.sort((a, b) => {
      if (selectedOptions.find((opt) => a.value === opt.value)) {
        return -1;
      }
      if (selectedOptions.find((opt) => b.value === opt.value)) {
        return 1;
      }
      return 0;
    });
  }, [filteredOptions, selectedOptions]);

  const virtualizer = useVirtualizer({
    count: sortedFilteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const handleSearch = (search: string) => {
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase() ?? [])
      )
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
    }
  };

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      {label ? <Label>{label}</Label> : null}
      <CommandInput
        onValueChange={handleSearch}
        placeholder={placeholder}
        className={cn("border-0")}
      />
      <CommandEmpty>No item found.</CommandEmpty>
      <CommandGroup
        ref={parentRef}
        style={{
          height: 300,
          width: "100%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualOptions.map((virtualOption) => (
            <CommandItem
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualOption.size}px`,
                transform: `translateY(${virtualOption.start}px)`,
              }}
              key={sortedFilteredOptions[virtualOption.index]?.value}
              value={sortedFilteredOptions[virtualOption.index]?.value}
              onSelect={(selectedItem) => {
                const item = sortedFilteredOptions[virtualOption.index];
                onSelectOption?.(item ?? selectedItem);
              }}
              className="flex items-center justify-between"
            >
              <Check
                className={cn("mr-2 h-4 w-4 opacity-0", {
                  "opacity-100":
                    selectedOptions.find(
                      (opt) =>
                        opt.value ===
                        sortedFilteredOptions[virtualOption.index]?.value
                    ) ?? "",
                })}
              />
              <div className="line-clamp-1 flex flex-1 items-center justify-between leading-4">
                <div>{sortedFilteredOptions[virtualOption.index]?.label}</div>
              </div>
            </CommandItem>
          ))}
        </div>
      </CommandGroup>
      <CommandSeparator />
      <div className="flex justify-end px-4 py-2">
        <Button onClick={onClear} variant="ghost">
          Clear
        </Button>
      </div>
    </Command>
  );
};

interface VirtualizedComboboxProps {
  value?: Option[];
  options: Option[];
  label?: string;
  searchPlaceholder?: string;
  onSelect?: (items: Option[]) => void;
  required?: boolean;
  isMulti?: boolean;
}

export function VirtualizedCombobox({
  value,
  options,
  label,
  searchPlaceholder,
  onSelect,
  required,
  isMulti,
}: VirtualizedComboboxProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(value ?? []);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    if (!value) return;

    setSelectedOptions(value);
  }, [value]);

  const handleSelect = (currentValue: Option) => {
    let newOptions: Option[] = [];
    if (isMulti) {
      newOptions = selectedOptions.find(
        (opt) => opt.value === currentValue.value
      )
        ? selectedOptions.filter(
            (option) => option.value !== currentValue.value
          )
        : [...selectedOptions, currentValue];
      onSelect?.(newOptions);
    } else {
      newOptions = [currentValue];
      onSelect?.([currentValue]);
    }

    // setOpen(false);
    setSelectedOptions(newOptions);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild className="group relative">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "relative flex w-full rounded-md border border-gray-300 bg-white px-3 pb-1 pr-8 text-left ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300",
            label ? "h-12 md:h-14 md:pt-6 pt-5 text-sm" : "h-10"
          )}
          ref={(element) => setButtonWidth(element?.offsetWidth ?? 0)}
        >
          {label && (
            <label
              className={cn(
                "absolute left-0 top-0 px-3 pt-1 text-sm font-semibold tracking-wide text-primary md:pt-2"
              )}
            >
              {label}
              {required ? <span className="text-red-500">*</span> : null}
            </label>
          )}
          <div className={cn("w-full text-left leading-3", label && "text-xs")}>
            {selectedOptions.length === 0 ? (
              searchPlaceholder
            ) : selectedOptions.length === 1 ? (
              selectedOptions[0].label
            ) : selectedOptions.length > 1 ? (
              <div>
                {selectedOptions[0].label}{" "}
                <span className="">+{selectedOptions.length - 1} </span>
              </div>
            ) : null}
          </div>
          <div className="absolute right-3 top-0 flex h-full items-center">
            <ChevronDownIcon className="h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        // To prevent the change to the top of the search
        // https://www.radix-ui.com/primitives/docs/components/popover#content
        avoidCollisions={false}
        side="bottom"
        className={cn("p-0", "w-[--radix-popover-trigger-width]")}
        style={{ width: buttonWidth, minWidth: MIN_WIDTH, zIndex: 9999 }}
        align={buttonWidth < MIN_WIDTH ? "start" : "center"}
      >
        <VirtualizedCommand
          options={options}
          placeholder={searchPlaceholder ?? "Search"}
          selectedOptions={selectedOptions}
          onSelectOption={handleSelect}
          onClear={() => {
            setSelectedOptions([]);
            setOpen(false);
            onSelect?.([]);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

type ControlledVirtualizedSearchbarProps<T extends FieldValues> = {
  control: Control<T>;
  fieldName: Path<T>;
  options: Option[];
  label?: string;
  searchPlaceholder?: string;
  onSelect?: (items: Option[]) => void;
  className?: string;
  required?: boolean;
  isMulti?: boolean;
};

export const ControlledVirtualizedSearchbar = <T extends FieldValues>({
  control,
  fieldName,
  options,
  label,
  searchPlaceholder,
  onSelect,
  className,
  required,
  isMulti,
}: ControlledVirtualizedSearchbarProps<T>) => {
  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <div className={cn("flex flex-col gap-y-2", className)}>
            <VirtualizedCombobox
              value={field.value}
              options={options}
              label={label}
              searchPlaceholder={searchPlaceholder}
              onSelect={onSelect ?? field.onChange}
              required={required}
              isMulti={isMulti}
            />
            {error?.message ? <InputError error={error.message} /> : null}
          </div>
        </FormItem>
      )}
    />
  );
};

const InputError = ({ error }: { error?: string }) => {
  return error ? (
    <div className="!m-0 text-sm text-red-500">{error}</div>
  ) : null;
};
