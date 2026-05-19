import { useAppState } from '../data/store';
import type { PlayerCount } from '../data/store';

/**
 * 인원수 세그먼티드 선택기 — 1/2/3/4/단체 5옵션, 기본 4.
 * 디자인 시스템 (lib/ds.ts):
 *  - 컨테이너: rounded-[8px] (CTA 라디우스 매칭), bg gray-50 #F0F2F5
 *  - 아이템: rounded-[6px], 활성=white shadow, 비활성=gray-500 #6A7683
 *  - 타이포: text-[13px] font-bold tracking-[-0.2px]
 */
const OPTIONS: Array<{ value: PlayerCount; label: string }> = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 'group', label: '단체' },
];

export function PlayerCountStepper() {
  const { playerCount, setPlayerCount } = useAppState();
  return (
    <div className="inline-flex rounded-[8px] bg-[#F0F2F5] p-0.5 gap-0.5">
      {OPTIONS.map(opt => {
        const active = opt.value === playerCount;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => setPlayerCount(opt.value)}
            className={`px-2.5 h-8 min-w-[34px] rounded-[6px] text-[13px] font-bold tracking-[-0.2px] transition-colors ${
              active ? 'bg-white text-[#272833] shadow-sm' : 'text-[#6A7683]'
            }`}
          >
            {opt.label}{opt.value !== 'group' ? '인' : ''}
          </button>
        );
      })}
    </div>
  );
}
