"use client";

import * as React from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  id,
  ...props
}: React.ComponentProps<typeof RadioPrimitive.Root> & { id?: string }) {
  return (
    <RadioPrimitive.Root
      id={id}
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-background text-primary transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[checked]:border-primary",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-2 items-center justify-center rounded-full bg-primary transition-opacity group-data-[checked]/radio-group-item:opacity-100"
      />
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
