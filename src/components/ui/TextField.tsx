import { cn } from "@/lib/utils";

type CommonProps = {
  label: string;
  hint?: string;
  className?: string;
};

type InputProps = CommonProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
    kind?: "input";
  };

type AreaProps = CommonProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    kind: "textarea";
  };

// 16px base keeps iOS from auto-zooming the field on focus (pinch-zoom stays
// enabled app-wide for accessibility).
const inputCls =
  "w-full rounded-2xl border border-border bg-surface-2/60 px-4 py-3 text-[16px] text-text placeholder:text-text-subtle outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const labelCls =
  "mb-1.5 block px-1 text-[12.5px] font-medium lowercase text-text-subtle";
const hintCls = "mt-1.5 block px-1 text-[11.5px] text-text-subtle";

export function TextField(props: InputProps | AreaProps) {
  if (props.kind === "textarea") {
    const { label, hint, kind: _kind, className, ...rest } = props;
    return (
      <label className="block">
        <span className={labelCls}>{label}</span>
        <textarea
          {...rest}
          className={cn(inputCls, "min-h-[88px] resize-none", className)}
        />
        {hint ? <span className={hintCls}>{hint}</span> : null}
      </label>
    );
  }
  const { label, hint, kind: _kind, className, ...rest } = props;
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input {...rest} className={cn(inputCls, className)} />
      {hint ? <span className={hintCls}>{hint}</span> : null}
    </label>
  );
}
