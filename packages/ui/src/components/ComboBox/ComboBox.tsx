"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "../Button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../Command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../Popover"

export type ComboBoxOption = {
  value: string;
  label: string;
};

export type ComboBoxProps = {
  options: ComboBoxOption[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

export function ComboBox({ options, value, onChange, isOpen, setIsOpen, placeholder, searchPlaceholder, emptyMessage }: ComboBoxProps) {

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((option) => option?.value === value)?.label
            : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setIsOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}