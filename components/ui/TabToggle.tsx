import { playTick } from "@/lib/sounds";

interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface TabToggleProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (value: T) => void;
}

export default function TabToggle<T extends string>({
  tabs, active, onChange,
}: TabToggleProps<T>) {
  return (
    <div className="flex bg-[#111118] border border-white/8 p-1 gap-1">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => { playTick(); onChange(value); }}
          className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${
            active === value
              ? "bg-white text-black"
              : "text-gray-600 hover:text-gray-400"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}