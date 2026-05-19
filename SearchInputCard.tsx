import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Calendar, Users, ChevronDown } from 'lucide-react';
import { useAppState } from '../data/store';
import { getCountriesIn } from '../lib/countries';
import { DateSheet } from './DateSheet';
import { PlayerCountStepper } from './PlayerCountStepper';
import { RegionPicker } from './region-picker';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatDateLabel(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = DAY_NAMES[d.getDay()];
  return `${m}/${day} (${dow})`;
}

interface Props {
  /** 하단 검색 CTA 노출 여부 (실시간 홈에서만 true) */
  showSearchButton?: boolean;
}

/**
 * 탭 진입 직후 노출되는 검색 입력 카드.
 * - "어디로 / 언제 / 인원수" 3종 입력을 한 카드 안에 배치
 * - 실시간 탭과 패키지 탭에서 공유. store 기반 입력 상태는 탭 전환해도 유지
 * - showSearchButton=true일 때 하단에 "검색" CTA 노출 → /search 결과 페이지로 진입
 */
export function SearchInputCard({ showSearchButton = false }: Props = {}) {
  const navigate = useNavigate();
  const {
    selectedCountries,
    selectedRegions,
    selectedSubRegions,
    selectedDate,
    setSelectedDate,
    dateTouched,
  } = useAppState();

  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);

  // 어디로 라벨 — 비어있으면 placeholder
  const countries = getCountriesIn(selectedCountries);
  const isEmptyCountries = countries.length === 0;
  const isMultiCountry = countries.length >= 2;

  let whereLabel: string;
  if (isEmptyCountries) {
    whereLabel = '골프장, 지역 검색';
  } else if (isMultiCountry) {
    // 다중 나라 — 이름 텍스트로 표기 (3개까지 노출, 그 이상은 "외 N개")
    const names = countries.map(c => c.name);
    if (names.length <= 3) {
      whereLabel = names.join(' · ');
    } else {
      whereLabel = `${names.slice(0, 3).join(' · ')} 외 ${names.length - 3}개`;
    }
  } else {
    const country = countries[0];
    const allRegionsForCountry = country.regions.map(r => r.id);
    const selRegionsInCountry = selectedRegions.filter(r => allRegionsForCountry.includes(r));
    const allRegions = selRegionsInCountry.length === 0 || selRegionsInCountry.length === allRegionsForCountry.length;

    if (allRegions) {
      whereLabel = `${country.flag} ${country.name} · 전체`;
    } else if (selRegionsInCountry.length === 1) {
      const regionId = selRegionsInCountry[0];
      const region = country.regions.find(r => r.id === regionId);
      const subsForRegion = selectedSubRegions.filter(s => region?.subRegions.includes(s));
      if (subsForRegion.length === 1) {
        whereLabel = `${country.flag} ${country.name} · ${subsForRegion[0]}`;
      } else if (subsForRegion.length > 1) {
        whereLabel = `${country.flag} ${country.name} · ${subsForRegion[0]} 외 ${subsForRegion.length - 1}`;
      } else {
        whereLabel = `${country.flag} ${country.name} · ${regionId}`;
      }
    } else {
      whereLabel = `${country.flag} ${country.name} · ${selRegionsInCountry.length}개 권역`;
    }
  }

  // 언제 라벨 — 사용자가 명시적으로 날짜를 선택하기 전이면 placeholder
  const dateLabel = dateTouched ? formatDateLabel(selectedDate) : '날짜 선택';

  const handleSearch = () => {
    navigate('/search', { state: { fromSearchCard: true } });
  };

  return (
    <div className="px-4 pt-3 pb-2">
      <div className="bg-white rounded-[10px] border border-[#E6EBF0] shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden">
        {/* 어디로 */}
        <button
          type="button"
          onClick={() => setRegionPickerOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#E6F8EE] flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#1AB277]" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <div className="text-[11px] font-medium text-[#9EABBA] tracking-[-0.2px] w-9 flex-shrink-0">어디로</div>
            <div className={`text-[14px] tracking-[-0.2px] truncate ${
              isEmptyCountries ? 'font-medium text-[#9EABBA]' : 'font-bold text-[#272833]'
            }`}>{whereLabel}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#9EABBA] flex-shrink-0" />
        </button>

        <div className="h-px bg-[#F0F2F5] mx-4" />

        {/* 언제 */}
        <button
          type="button"
          onClick={() => setDateSheetOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#FFF5E1] flex items-center justify-center flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#E08D10]" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <div className="text-[11px] font-medium text-[#9EABBA] tracking-[-0.2px] w-9 flex-shrink-0">언제</div>
            <div className={`text-[14px] tracking-[-0.2px] truncate ${
              dateTouched ? 'font-bold text-[#272833]' : 'font-medium text-[#9EABBA]'
            }`}>{dateLabel}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#9EABBA] flex-shrink-0" />
        </button>

        <div className="h-px bg-[#F0F2F5] mx-4" />

        {/* 인원수 */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E8F0FE] flex items-center justify-center flex-shrink-0">
            <Users className="w-3.5 h-3.5 text-[#2B6FD0]" strokeWidth={2.2} />
          </div>
          <div className="text-[11px] font-medium text-[#9EABBA] tracking-[-0.2px] w-9 flex-shrink-0">인원수</div>
          <div className="flex-1 flex justify-end">
            <PlayerCountStepper />
          </div>
        </div>
      </div>

      {showSearchButton && (
        <button
          type="button"
          onClick={handleSearch}
          className="mt-3 w-full py-3.5 rounded-[8px] bg-[#272833] text-white text-[14px] font-bold tracking-[-0.2px] hover:bg-[#1F2029] transition-colors"
        >
          검색
        </button>
      )}

      {/* 시트 / 모달 */}
      <DateSheet
        open={dateSheetOpen}
        onOpenChange={setDateSheetOpen}
        selectedDate={selectedDate}
        onSelect={(d) => { setSelectedDate(d); setDateSheetOpen(false); }}
      />
      <RegionPicker
        open={regionPickerOpen}
        onOpenChange={setRegionPickerOpen}
      />
    </div>
  );
}
