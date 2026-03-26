import { cn } from "@/lib/utils";

function Kbd({
  className,
  active,
  ...props
}: React.ComponentProps<"kbd"> & { active?: boolean }) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-[#55fc27] text-black backdrop-blur-lg pointer-events-none inline-flex h-7 w-fit min-w-7 items-center justify-center gap-1 rounded-sm px-1.5 text-sm font-sans tracking-wider font-bold select-none",
        "[&_svg:not([class*='size-'])]:size-4",
        "[[data-slot=tooltip-content]_&]:bg-[#55fc27]/20 [[data-slot=tooltip-content]_&]:text-[#55fc27] dark:[[data-slot=tooltip-content]_&]:bg-[#55fc27]/10",
        active && "bg-[#55fc27]/80 text-black",
        className
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
