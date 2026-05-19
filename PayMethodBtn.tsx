export function PayMethodBtn({ active, onClick, label, icon, full }: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1 py-2.5 rounded-md text-[14px] font-medium border transition-all ${
        full ? 'w-[calc(50%-3px)]' : 'flex-1'
      } ${
        active
          ? 'border-[#272833] border-[1.4px] text-[#272833] font-bold'
          : 'border-[#BFCAD6] text-[#535D67]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
