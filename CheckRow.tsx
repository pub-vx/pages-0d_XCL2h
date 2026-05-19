import { ChevronRight } from 'lucide-react';

export function CheckRow({ checked, onChange, label, bold, hasArrow }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  bold?: boolean;
  hasArrow?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <button onClick={() => onChange(!checked)} className="flex items-center gap-2.5">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          checked ? 'bg-[#1AB277] border-[#1AB277]' : 'border-[#BFCAD6] bg-white'
        }`}>
          <svg viewBox="0 0 12 12" className="w-3 h-3">
            <path d="M2 6l3 3 5-5" stroke={checked ? 'white' : '#BFCAD6'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className={`text-[14px] text-[#272833] tracking-[-0.4px] ${bold ? 'font-bold' : ''}`}>
          {label}
        </span>
      </button>
      {hasArrow && (
        <ChevronRight className="w-4 h-4 text-[#9EABBA]" />
      )}
    </div>
  );
}
