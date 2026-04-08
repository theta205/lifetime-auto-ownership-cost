"use client";

interface InputFieldProps {
  label: string;
  name: string;
  value: number | string;
  onChange: (name: string, value: number | string) => void;
  type?: "number" | "select";
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  options?: { value: string; label: string }[];
}

export function InputField({
  label,
  name,
  value,
  onChange,
  type = "number",
  min,
  max,
  step = 1,
  prefix,
  suffix,
  options,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        {prefix && (
          <span className="pl-3 text-sm text-gray-500 select-none">{prefix}</span>
        )}
        {type === "select" && options ? (
          <select
            name={name}
            value={value as string}
            onChange={(e) => onChange(name, e.target.value)}
            className="flex-1 bg-transparent py-2 pl-2 pr-3 text-sm text-gray-900 outline-none"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            name={name}
            value={value as number}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
            className="flex-1 bg-transparent py-2 pl-2 pr-3 text-sm text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        )}
        {suffix && (
          <span className="pr-3 text-sm text-gray-500 select-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}
