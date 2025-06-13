"use client"

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
  disabled?: boolean;
  className?: string;
};

export function ComboBox({ className, options, value, onChange, isOpen, setIsOpen, placeholder, searchPlaceholder, emptyMessage, disabled = false }: ComboBoxProps) {

  // Si está deshabilitado, nunca abrir el popover
  const handleOpenChange = (open: boolean) => {
    if (!disabled) {
      setIsOpen(open)
    }
  }

  return (
    <Popover open={isOpen && !disabled} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen && !disabled}
          className={cn("w-full justify-between", className, disabled && "opacity-50 cursor-not-allowed pointer-events-none")}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          {value
            ? options.find((option) => option?.value === value)?.label
            : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" hidden={disabled}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} disabled={disabled} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    if (!disabled) {
                      onChange(currentValue === value ? "" : currentValue)
                      setIsOpen(false)
                    }
                  }}
                  disabled={disabled}
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