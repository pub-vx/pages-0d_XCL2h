import { Map as MapIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppState } from '../data/store';

/**
 * 일본 지도로 찾기 진입 배너.
 * 클릭 시:
 *  - selectedCountries=['jp'] 강제 (일본 지도로 랜딩)
 *  - selectedRegions/SubRegions 초기화 → 지도 모드에서 "전체" 칩이 기본 활성
 *  - /map 이동
 */
export function MapEntryBanner() {
  const navigate = useNavigate();
  const { setSelectedCountries, setSelectedRegions, setSelectedSubRegions } = useAppState();

  const handleClick = () => {
    setSelectedCountries(['jp']);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    navigate('/map');
  };

  return (
    <div className="px-4 py-3 bg-white">
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center gap-3.5 bg-[#F0F2F5] rounded-[10px] px-4 py-4"
      >
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <MapIcon className="w-[22px] h-[22px] text-[#2B6FD0]" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[15px] font-bold text-[#272833] tracking-[-0.3px] leading-tight">
            일본 지도로 찾기 🗺️
          </p>
          <p className="text-[13px] font-medium text-[#6A7683] tracking-[-0.2px] leading-snug mt-1">
            공항 근처 골프장을 탐색해 보세요!
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-[#272833] flex-shrink-0" />
      </button>
    </div>
  );
}
