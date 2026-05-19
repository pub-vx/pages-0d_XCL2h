import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronUp, Info, Home, Search } from 'lucide-react';
import { RegionChips } from './RegionChips';
import { DateStrip } from './DateStrip';
import { SearchModal } from './SearchModal';
import { useAppState } from '../data/store';
import { COUNTRIES, getCountriesIn } from '../lib/countries';

export function TopSearchBar() {
  const navigate = useNavigate();
  const {
    selectedCountries, setSelectedCountries,
    selectedRegions, setSelectedRegions,
    setSelectedSubRegions,
    arrivalContext,
  } = useAppState();
  const currentCountry = getCountriesIn(selectedCountries)[0];
  const countryLabel = currentCountry?.name ?? '일본';

  const [showCalcInfo, setShowCalcInfo] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // 항공편 컨텍스트 여부 (도착 시각 계산 안내 노출 조건)
  const isFlight = !!arrivalContext?.flightCode;

  return (
    <div className="sticky top-0 z-50 bg-white">
      {/* 1) 타이틀 바 — 항상 노출 */}
      <div className="flex items-center h-12 px-4">
        <button onClick={handleBack} className="-ml-1 p-1" aria-label="뒤로가기">
          <ArrowLeft className="w-5 h-5 text-[#272833]" />
        </button>
        <div className="flex-1 flex justify-center relative">
          <button
            onClick={() => setShowCountryPicker(s => !s)}
            className="inline-flex items-baseline text-base font-bold text-[#272833]"
          >
            <span className="underline underline-offset-4 decoration-[1.5px]">{countryLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 self-center ml-0.5 text-[#535D67] transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} />
            <span className="ml-1.5">골프장 목록</span>
          </button>

          {showCountryPicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowCountryPicker(false)} />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-40 bg-white border border-[#E6EBF0] rounded-[8px] shadow-lg overflow-hidden min-w-[160px]">
                {COUNTRIES.map(c => {
                  const isCurrent = c.code === currentCountry?.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        // 프로토타입 시연을 위해 준비중 나라도 클릭 가능 (실제 서비스에서는 disabled 처리)
                        setSelectedCountries([c.code]);
                        setSelectedRegions([]);
                        setSelectedSubRegions([]);
                        setShowCountryPicker(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-[13px] tracking-[-0.2px] text-left transition-colors ${
                        isCurrent
                          ? 'bg-[#272833] text-white font-bold'
                          : c.available
                            ? 'text-[#272833] font-medium hover:bg-[#F9FAFB]'
                            : 'text-[#535D67] font-medium hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="flex-1">{c.name}</span>
                      {!c.available && !isCurrent && (
                        <span className="text-[10px] font-bold text-[#9EABBA] tracking-[-0.1px]">준비중</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <button onClick={() => setSearchModalOpen(true)} className="p-1" aria-label="검색">
          <Search className="w-5 h-5 text-[#272833]" />
        </button>
        <button onClick={() => navigate('/')} className="-mr-1 p-1" aria-label="홈">
          <Home className="w-5 h-5 text-[#272833]" />
        </button>
      </div>


      {/* 권역 chips — 우측 액션 미노출 (검색은 상단 헤더로 이동) */}
      <RegionChips
        selectedRegions={selectedRegions}
        onRegionsChange={setSelectedRegions}
        rightAction="none"
      />
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />


      {/* 항공편 모드일 때 도착 시각 계산 안내 */}
      {isFlight && (
        <div className="px-4 py-1.5 bg-[#F9FAFB] border-b border-[#F0F2F5]">
          <button
            onClick={() => setShowCalcInfo(s => !s)}
            className="w-full flex items-center gap-1 text-left"
          >
            <Info className="w-3 h-3 text-[#9EABBA] flex-shrink-0" />
            <span className="text-[11px] text-[#6A7683] flex-1">
              골프장 도착 시각은 <span className="font-medium">입국 60분 + 평균 60km/h</span> 기준 추정값
            </span>
            {showCalcInfo ? <ChevronUp className="w-3 h-3 text-[#9EABBA]" /> : <ChevronDown className="w-3 h-3 text-[#9EABBA]" />}
          </button>
          {showCalcInfo && (
            <div className="mt-2 p-2.5 bg-white rounded-[8px] border border-[#E6EBF0] text-[11px] text-[#6A7683] leading-relaxed">
              <p className="font-bold text-[#272833] mb-1">계산 공식</p>
              <p>골프장 도착 = <span className="text-[#272833] font-medium">항공편 도착시각 + 60분(입국수속) + 이동시간</span></p>
              <p className="mt-1">이동시간 = 직선거리(km) ÷ 60km/h</p>
              <p className="mt-2 text-[#9EABBA]">
                ※ 실제 도로 굴곡, 입국 혼잡도, 시내 정체 등에 따라 달라질 수 있어요. 여유 있게 일정을 잡아주세요.
              </p>
            </div>
          )}
        </div>
      )}

      <DateStrip />

    </div>
  );
}
