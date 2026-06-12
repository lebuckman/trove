import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={cn(
        "tappable inline-flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-colors disabled:opacity-40 disabled:active:scale-100",
        variant === "primary"
          ? "bg-accent text-bg hover:bg-accent-strong"
          : "border border-border-strong bg-surface-2 text-text",
        className,
      )}
    >
      {children}
    </button>
  );
}
