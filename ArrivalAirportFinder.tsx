import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plane, MapPin, ChevronRight } from 'lucide-react';
import { airports } from '../data/mockData';
import {
  KOREAN_DEPARTURES,
  FLIGHT_DURATIONS,
  formatFlightDuration,
} from '../data/flightDurations';
import { useAppState } from '../data/store';

/**
 * 한국 출발 공항 → 일본 도착 공항 기준으로 골프장 찾기.
 *
 * UX:
 *  - 상단 chip strip: 한국 출발 공항 (인천/김포/부산/대구/청주/제주). 선택값은 컴포넌트 로컬 state.
 *  - 하단 card strip: 선택된 출발 공항 기준으로 직항이 있는 일본 hub 공항 카드(비행시간 짧은 순).
 *  - 카드 탭 시 selectedCountries=jp, selectedRegions/SubRegions 초기화 + /map?airport={id} 진입.
 *  - 직항이 없으면 안내 텍스트 노출.
 *
 * 일본 한정 진입점이라 한국 ↔ 일본 데이터(flightDurations) 그대로 사용.
 */
export function ArrivalAirportFinder() {
  const navigate = useNavigate();
  const { setSelectedCountries, setSelectedRegions, setSelectedSubRegions } = useAppState();

  const [departureId, setDepartureId] = useState<string>('ICN');

  /**
   * 일본 hub 공항 전체 — 직항 있음(비행시간 짧은 순) → 직항 없음(공항 정의 순서) 으로 정렬.
   * 직항 없는 케이스도 카드로 노출하여 "현재 선택지" 를 명확히 한다.
   */
  const arrivalCards = useMemo(() => {
    const row = FLIGHT_DURATIONS[departureId] ?? {};
    const entries = airports
      .filter(a => a.tier === 'hub')
      .map((a, idx) => ({ airport: a, minutes: row[a.id] ?? null, idx }));
    const direct = entries
      .filter(e => typeof e.minutes === 'number')
      .sort((a, b) => (a.minutes! - b.minutes!));
    const nonDirect = entries.filter(e => e.minutes === null);
    return [...direct, ...nonDirect];
  }, [departureId]);

  const handleCardClick = (airportId: string) => {
    // 직항 유무와 무관하게 지도에서 해당 공항을 포커스 상태로 진입
    setSelectedCountries(['jp']);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    navigate(`/map?airport=${airportId}`);
  };

  /** "전체보기" — 일본 전 권역 지도로 진입 (공항 포커스 없음) */
  const handleViewAll = () => {
    setSelectedCountries(['jp']);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    navigate('/map');
  };

  return (
    <div className="bg-white px-4 pt-5 pb-4">
      {/* 타이틀 + 전체보기 */}
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[16px] font-bold text-[#272833] tracking-[-0.3px] leading-tight">
          공항 기준으로 일본 티타임 탐색
        </p>
        <button
          type="button"
          onClick={handleViewAll}
          className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[#6A7683] tracking-[-0.2px] hover:text-[#272833] transition-colors"
        >
          전체보기
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 출발 공항 chip strip — hover 시 안내 라벨 (모바일 무시) */}
      <div className="-mx-4 px-4 mb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 w-max">
          {KOREAN_DEPARTURES.map(k => {
            const active = k.id === departureId;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setDepartureId(k.id)}
                title="출발 공항에 따라 도착 공항 순서가 자동으로 정렬돼요"
                className={`flex-shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full border text-[13px] font-bold tracking-[-0.2px] transition-colors ${
                  active
                    ? 'bg-white border-[#272833] text-[#272833]'
                    : 'bg-white border-[#E6EBF0] text-[#9EABBA] font-medium'
                }`}
              >
                <Plane className={`w-3.5 h-3.5 ${active ? 'text-[#272833]' : 'text-[#C5CDD5]'}`} strokeWidth={2.2} />
                <span>
                  {k.short} <span className={active ? 'text-[#6A7683]' : 'text-[#C5CDD5]'}>({k.id})</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 도착 공항 카드 strip — 직항(짧은 순) 다음 직항 없는 공항. 클릭은 모두 가능, 시간 표기는 회색 처리로 약하게 구분 */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 w-max">
          {arrivalCards.map(({ airport, minutes }) => {
            const hasDirect = typeof minutes === 'number';
            return (
              <button
                key={airport.id}
                type="button"
                onClick={() => handleCardClick(airport.id)}
                className="flex-shrink-0 w-[148px] bg-[#F9FAFB] rounded-[10px] border border-[#E6EBF0] p-3 text-left hover:border-[#272833] transition-colors"
              >
                <p className="inline-flex items-center gap-1 text-[13px] font-bold text-[#272833] tracking-[-0.2px]">
                  <MapPin className="w-3.5 h-3.5 text-[#1AB277]" strokeWidth={2.4} />
                  <span className="truncate">{airport.name}</span>
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#6A7683] tracking-[-0.2px]">
                  {airport.code} · {airport.region}
                </p>
                <p className={`mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold tracking-[-0.2px] ${hasDirect ? 'text-[#272833]' : 'text-[#9EABBA]'}`}>
                  <Plane className={`w-3 h-3 ${hasDirect ? 'text-[#1AB277]' : 'text-[#C5CDD5]'}`} strokeWidth={2.4} />
                  {hasDirect ? `약 ${formatFlightDuration(minutes!, 'long')}` : '직항 없음'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
