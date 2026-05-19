export function InfoRow({ label, value, bold, color, sub, trailing }: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  sub?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-[14px] text-[#6A7683] tracking-[-0.7px]">{label}</span>
      <div className="flex items-center">
        <div className="text-right">
          <span
            className={`text-[14px] tracking-[-0.47px] ${bold ? 'font-bold' : 'font-medium'}`}
            style={{ color: color || '#272833' }}
          >
            {value}
          </span>
          {sub && (
            <p className="text-[11px] text-[#9EABBA] mt-0.5">{sub}</p>
          )}
        </div>
        {trailing}
      </div>
    </div>
  );
}
