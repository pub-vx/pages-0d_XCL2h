import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Map as MapIcon, List, Search } from 'lucide-react';
import { REGION_IDS } from '../lib/regions';
import { getCountry } from '../lib/countries';
import { useAppState } from '../data/store';

interface Props {
  selectedRegions: string[];
  onRegionsChange: (regions: string[]) => void;
  /** 우측 액션 버튼 클릭 핸들러. 'auto' 모드에서 미지정 시 자동으로 /search ↔ /map 전환 */
  onSearchClick?: () => void;
  /**
   * 우측 액션 버튼 종류
   *  - 'auto'(default): 현재 라우트에 따라 Map(검색→지도) / List(지도→검색) 토글
   *  - 'search': 돋보기 아이콘 — onSearchClick 콜백 호출 (검색 모달 트리거용)
   *  - 'none': 우측 버튼 미노출
   */
  rightAction?: 'auto' | 'search' | 'none';
}

export function RegionChips({ selectedRegions, onRegionsChange, onSearchClick, rightAction = 'auto' }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMapMode = location.pathname === '/map';

  // 현재 선택된 나라의 1차 권역으로 칩 구성 — 일본 기본
  const { selectedCountries } = useAppState();
  const countryCode = selectedCountries[0] ?? 'jp';
  const country = getCountry(countryCode);
  const REGIONS: readonly string[] = country?.regions.map(r => r.id) ?? REGION_IDS;

  // 모드 전환 시 안내 툴팁 (3초 노출)
  const [tipVisible, setTipVisible] = useState(true);
  useEffect(() => {
    setTipVisible(true);
    const t = setTimeout(() => setTipVisible(false), 3000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // "전체" = 빈 배열(필터 없음) 또는 9개 모두 선택된 상태 — 둘 다 동일하게 무필터로 취급
  const isAllSelected = selectedRegions.length === 0 || selectedRegions.length === REGIONS.length;

  // 활성 권역 칩을 가운데로 자동 스크롤 — 진입 시 / 권역 변경 시
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const btn = activeChipRef.current;
    const container = chipsScrollRef.current;
    if (!btn || !container) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const offset = btnRect.left - containerRect.left - (containerRect.width / 2) + (btnRect.width / 2);
    container.scrollTo({ left: container.scrollLeft + offset, behavior: 'auto' });
  }, [selectedRegions]);

  // 단일 선택(라디오) 모델 — 탭 시 그 권역만 선택. "전체" 칩 또는 활성 칩 재탭으로 전체 복귀
  const selectRegion = (region: string) => {
    onRegionsChange([region]);
  };
  const selectAll = () => {
    // 빈 배열로 두는 게 "필터 없음" 의도를 명확히 표현 (GolfCourseList도 빈 배열을 무필터로 처리)
    onRegionsChange([]);
  };

  return (
    <div className="flex items-center gap-2 px-4 pt-2.5 pb-2">
      <div className="relative flex-1 min-w-0">
        <div ref={chipsScrollRef} className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {/* "전체" 칩 — 단일 권역 선택을 해제하고 전체 노출로 복귀 */}
          <button
            ref={isAllSelected ? activeChipRef : undefined}
            onClick={selectAll}
            className={`px-3.5 py-2 rounded-full text-[14px] whitespace-nowrap transition-colors flex-shrink-0 border tracking-[-0.2px] ${
              isAllSelected
                ? 'bg-white border-[#272833] text-[#272833] font-bold'
                : 'bg-white border-[#E6EBF0] text-[#9EABBA] font-medium'
            }`}
          >
            전체
          </button>
          {REGIONS.map(region => {
            const isSelected = !isAllSelected && selectedRegions.length === 1 && selectedRegions[0] === region;
            return (
              <button
                key={region}
                ref={isSelected ? activeChipRef : undefined}
                onClick={() => (isSelected ? selectAll() : selectRegion(region))}
                className={`px-3.5 py-2 rounded-full text-[14px] whitespace-nowrap transition-colors flex-shrink-0 border tracking-[-0.2px] ${
                  isSelected
                    ? 'bg-[#272833] border-[#272833] text-white font-bold'
                    : 'bg-white border-[#D9E0E8] text-[#6A7683] font-medium'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* 우측 액션 — 라우트 자동 전환 / 검색 / 비노출 */}
      {rightAction !== 'none' && (
        <div className="relative flex-shrink-0">
          {rightAction === 'search' ? (
            <button
              onClick={() => { setTipVisible(false); onSearchClick?.(); }}
              className="p-2 text-[#272833]"
              aria-label="검색"
            >
              <Search className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setTipVisible(false);
                const defaultNav = () => isMapMode
                  ? navigate('/search', { state: { fromMap: true } })
                  : navigate('/map');
                (onSearchClick ?? defaultNav)();
              }}
              className="p-2 text-[#272833]"
              aria-label={isMapMode ? '목록보기' : '지도보기'}
            >
              {isMapMode ? <List className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
            </button>
          )}

          {rightAction === 'auto' && tipVisible && (
            <div className="absolute right-0 top-full mt-1 z-30 pointer-events-none">
              <div
                className="relative px-3 py-2 bg-[#272833] text-white rounded-[6px] whitespace-nowrap"
                style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px', boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}
              >
                <span>눌러서 {isMapMode ? '목록' : '지도'}으로 볼 수 있어요 👆</span>
                <div className="absolute -top-1 right-3 w-2 h-2 bg-[#272833] rotate-45" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
