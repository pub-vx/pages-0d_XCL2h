import { useNavigate } from 'react-router';
import type { GolfCourse } from '../../data/mockData';
import { formatJpy, formatKrw, jpyToKrw } from '../../data/mockData';
import { DetailDateStrip } from './DetailDateStrip';
import { KrwHint } from '../KrwHint';

interface TeeTimeTabProps {
  course: GolfCourse;
  selectedDate: Date;
  onDateChange: (d: Date) => void;
}

export function TeeTimeTab({ course, selectedDate, onDateChange }: TeeTimeTabProps) {
  const navigate = useNavigate();

  const handleTimeClick = (planId: string, time: string) => {
    navigate(`/checkout/${course.id}/${planId}?time=${time}`);
  };

  return (
    <div>
      {/* 날짜 스트립 */}
      <DetailDateStrip selectedDate={selectedDate} onDateChange={onDateChange} />

      {/* 플랜 카드들 */}
      <div className="px-4 pt-2 pb-6 space-y-4">
        {course.plans.length > 0 ? (
          course.plans.map(plan => {
            // 의미 있는 옵션만 표기 — 가격 구성 요소(세금/시설이용료/소비세)는 제외
            const meaningful = plan.includes.filter(
              i => !['세금', '시설이용료', '소비세'].includes(i)
            );
            const optionLine = [
              plan.roundCode === '18H' ? '18홀' : plan.roundCode,
              plan.minPlayer > 1 ? `${plan.minPlayer}인 필수` : `${plan.maxPlayer}인까지`,
              ...meaningful,
            ].join(' · ');
            return (
              <div key={plan.id} className="border border-[#E6EBF0] rounded-[8px] overflow-hidden bg-[#F9FAFB]">
                {/* 카드 상단: 플랜명·옵션(좌) + 가격(우) — items-start로 베이스라인 정렬 */}
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4
                      className="text-[#272833] truncate"
                      style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}
                    >
                      {plan.name}
                    </h4>
                    <p
                      className="text-[#6A7683] mt-1"
                      style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}
                    >
                      {optionLine}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#272833]" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>
                      {formatJpy(plan.basePrice)}
                    </p>
                    <p className="text-[#9EABBA] mt-1" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.2px' }}>
                      <KrwHint text={formatKrw(jpyToKrw(plan.basePrice))} />
                    </p>
                  </div>
                </div>

                {/* 카드 하단: 티타임 칩 (그레이톤 유지) */}
                <div className="px-4 py-3 border-t border-[#E6EBF0]">
                  <div className="flex flex-wrap gap-2">
                    {plan.times.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeClick(plan.id, time)}
                        className="px-3.5 py-2 rounded-[8px] text-[14px] font-medium border border-[#D9E0E8] text-[#272833] bg-white hover:border-[#1AB277] hover:bg-[#F2FDF7] hover:text-[#1AB277] active:bg-[#E6F9F0] transition-all"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <p className="text-[14px] text-[#9EABBA]">예약 가능한 티타임이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
