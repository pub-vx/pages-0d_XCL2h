import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './ui/sheet';
import { Slider } from './ui/slider';
import { formatKrw, jpyToKrw, EXCHANGE_RATE, EXCHANGE_RATE_DATE } from '../data/mockData';
import { useAppState } from '../data/store';
import { COUNTRIES } from '../lib/countries';
import { toggleInArray } from '../lib/selection';

export interface FilterState {
  timeSlots: string[];
  playStyles: string[];
  inclusions: string[];
  priceRange: [number, number];
}

/** 1인 라운드 가격 슬라이더 범위 (JPY) — 시드 데이터 분포에 맞춘 기본 구간 */
export const PRICE_RANGE_MIN = 5000;
export const PRICE_RANGE_MAX = 25000;
export const DEFAULT_PRICE_RANGE: [number, number] = [PRICE_RANGE_MIN, PRICE_RANGE_MAX];

/**
 * 표기 변형 매핑 — 동일 prefecture 의 다른 한글 음역을 한 chip 으로 합치고,
 * 토글 시 모든 변형을 pendingSubs 에 함께 넣어 매칭 누락을 막는다.
 * regions.ts 의 subRegions 순서에서 먼저 등장한 것이 canonical 표기.
 */
const SUB_VARIANTS: Record<string, string[]> = {
  '구마모토': ['구마모토', '쿠마모토'],
  '쿠마모토': ['구마모토', '쿠마모토'],
  '가나가와': ['가나가와', '카나가와'],
  '카나가와': ['가나가와', '카나가와'],
  '도치기': ['도치기', '토치기'],
  '토치기': ['도치기', '토치기'],
};

export const DEFAULT_FILTER: FilterState = {
  timeSlots: [],
  playStyles: [],
  inclusions: [],
  priceRange: DEFAULT_PRICE_RANGE,
};

export function getActiveFilterCount(state: FilterState): number {
  return state.timeSlots.length
    + state.playStyles.length
    + state.inclusions.length
    + (state.priceRange[0] !== PRICE_RANGE_MIN || state.priceRange[1] !== PRICE_RANGE_MAX ? 1 : 0);
}

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: FilterState;
  onApply: (state: FilterState) => void;
}

type Tab = 'round' | 'region';

export function FilterSheet({ open, onOpenChange, initial, onApply }: FilterSheetProps) {
  const {
    selectedCountries,
    selectedRegions, setSelectedRegions,
    selectedSubRegions, setSelectedSubRegions,
  } = useAppState();

  const [tab, setTab] = useState<Tab>('round');

  // 라운드 조건 (기존 FilterState)
  const [timeSlots, setTimeSlots] = useState<string[]>(initial.timeSlots);
  const [playStyles, setPlayStyles] = useState<string[]>(initial.playStyles);
  const [inclusions, setInclusions] = useState<string[]>(initial.inclusions);
  const [priceRange, setPriceRange] = useState<number[]>(initial.priceRange);

  // 지역 선택 (1·2차 권역) — 시트 내 임시 편집
  const [pendingRegions, setPendingRegions] = useState<string[]>(selectedRegions);
  const [pendingSubs, setPendingSubs] = useState<string[]>(selectedSubRegions);

  // 선택된 나라들의 권역 목록 (어디로 피커에서 고른 1차 권역만 노출 후보)
  const countryData = useMemo(
    () => COUNTRIES.filter(c => selectedCountries.includes(c.code)),
    [selectedCountries],
  );

  /**
   * 시트 열릴 때마다 외부 store 값을 1차/2차 모두 채워진 형태로 펼침.
   *
   * 모델 A 규칙:
   *  - store: selectedRegions = [] && selectedSubRegions = []  → "전체"  (모든 권역 + 모든 sub ON)
   *  - store: selectedRegions = ['규슈']  (sub 비어 있음)        → 규슈의 모든 sub ON  (= 규슈 전체)
   *  - store: selectedSubRegions = ['후쿠오카']                  → 후쿠오카만 ON, 규슈는 "부분 선택" 상태
   *
   * 결과적으로 시트에선 항상 pendingRegions/pendingSubs 가 일관되게 동시에 채워져 있다.
   */
  useEffect(() => {
    if (!open) return;
    setTimeSlots(initial.timeSlots);
    setPlayStyles(initial.playStyles);
    setInclusions(initial.inclusions);
    setPriceRange(initial.priceRange);
    setTab('round');

    const country = countryData[0];
    if (!country) {
      setPendingRegions([]);
      setPendingSubs([]);
      return;
    }
    const allRegionIds = country.regions.map(r => r.id);
    const isAll = selectedRegions.length === 0 && selectedSubRegions.length === 0;
    if (isAll) {
      // 전체 — 모든 1차 + 모든 2차 펼침
      setPendingRegions(allRegionIds);
      setPendingSubs(country.regions.flatMap(r => r.subRegions));
      return;
    }
    // 1차에 들어 있는 권역들의 모든 sub + 직접 선택된 sub 들의 합집합
    const subsFromRegions = country.regions
      .filter(r => selectedRegions.includes(r.id))
      .flatMap(r => r.subRegions);
    const expandedSubs = Array.from(new Set([...subsFromRegions, ...selectedSubRegions]));
    // 1차는 "그 권역 안에 sub 가 1개라도 있는" 권역으로 재계산 — 부분 선택 권역도 chip 활성으로 보이게
    const expandedRegions = country.regions
      .filter(r => r.subRegions.some(s => expandedSubs.includes(s)))
      .map(r => r.id);
    setPendingRegions(expandedRegions);
    setPendingSubs(expandedSubs);
  }, [open, initial, selectedRegions, selectedSubRegions, countryData]);

  const toggle = (list: string[], setter: (v: string[]) => void, value: string) => {
    setter(toggleInArray(list, value));
  };

  /**
   * 1차 권역 칩 토글:
   *  - 그 권역의 모든 sub 가 이미 ON 이면  → 모든 sub OFF + 1차 OFF
   *  - 그 외 (모두 OFF 또는 부분 ON)       → 모든 sub ON + 1차 ON
   */
  const toggleRegion = (regionId: string) => {
    const region = countryData[0]?.regions.find(r => r.id === regionId);
    if (!region) return;
    const allSubs = region.subRegions;
    const allOn = allSubs.every(s => pendingSubs.includes(s));
    if (allOn) {
      setPendingSubs(prev => prev.filter(s => !allSubs.includes(s)));
      setPendingRegions(prev => prev.filter(r => r !== regionId));
    } else {
      setPendingSubs(prev => Array.from(new Set([...prev, ...allSubs])));
      setPendingRegions(prev => (prev.includes(regionId) ? prev : [...prev, regionId]));
    }
  };

  /**
   * 2차 권역 칩 토글:
   *  - 변형(쿠마모토/구마모토 등) 함께 토글
   *  - 그 sub 가 속한 권역의 sub 가 1개라도 ON → 1차 권역 ON, 모두 OFF → 1차 권역 OFF
   */
  const toggleSub = (sub: string) => {
    const variants = SUB_VARIANTS[sub] ?? [sub];
    const isOn = variants.some(v => pendingSubs.includes(v));
    const nextSubs = isOn
      ? pendingSubs.filter(s => !variants.includes(s))
      : [...pendingSubs, ...variants];
    setPendingSubs(nextSubs);
    const region = countryData[0]?.regions.find(r => r.subRegions.includes(sub));
    if (region) {
      const someOn = region.subRegions.some(s => nextSubs.includes(s));
      setPendingRegions(prev => {
        const has = prev.includes(region.id);
        if (someOn && !has) return [...prev, region.id];
        if (!someOn && has) return prev.filter(r => r !== region.id);
        return prev;
      });
    }
  };

  const reset = () => {
    if (tab === 'round') {
      setTimeSlots([]);
      setPlayStyles([]);
      setInclusions([]);
      setPriceRange([PRICE_RANGE_MIN, PRICE_RANGE_MAX]);
    } else {
      setPendingRegions([]);
      setPendingSubs([]);
    }
  };

  /**
   * Apply 변환 — 펼친 pending 상태를 store 의 의미 모델로 압축:
   *  - 권역의 모든 sub 가 ON → selectedRegions 에 권역 ID 만, sub 는 안 넣음 (= "권역 전체")
   *  - 권역의 일부 sub 만 ON → selectedSubRegions 에 그 sub 들만 (1차는 제외)
   *  - 모든 권역의 모든 sub 가 ON → selectedRegions=[], selectedSubRegions=[] (= "전체")
   */
  const compressSelection = (): { regions: string[]; subs: string[] } => {
    const country = countryData[0];
    if (!country) return { regions: [], subs: [] };
    const finalRegions: string[] = [];
    const finalSubs: string[] = [];
    for (const region of country.regions) {
      const allSubs = region.subRegions;
      const selSubs = allSubs.filter(s => pendingSubs.includes(s));
      if (selSubs.length === 0) continue;
      if (selSubs.length === allSubs.length) {
        finalRegions.push(region.id);
      } else {
        finalSubs.push(...selSubs);
      }
    }
    if (finalRegions.length === country.regions.length && finalSubs.length === 0) {
      return { regions: [], subs: [] }; // "전체"
    }
    return { regions: finalRegions, subs: finalSubs };
  };

  const apply = () => {
    onApply({
      timeSlots,
      playStyles,
      inclusions,
      priceRange: [priceRange[0], priceRange[1]],
    });
    const { regions, subs } = compressSelection();
    setSelectedRegions(regions);
    setSelectedSubRegions(subs);
    onOpenChange(false);
  };

  // CTA 라벨용 active 카운트
  const roundActive = timeSlots.length + playStyles.length + inclusions.length
    + (priceRange[0] !== PRICE_RANGE_MIN || priceRange[1] !== PRICE_RANGE_MAX ? 1 : 0);
  const regionActive = pendingRegions.length + pendingSubs.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-2">
          <SheetTitle className="text-[16px] font-bold text-[#272833] tracking-[-0.3px] text-left">맞춤 골프장 검색</SheetTitle>
          <SheetDescription className="text-[12px] font-medium text-[#6A7683] tracking-[-0.2px] text-left">
            원하는 조건을 선택하세요
          </SheetDescription>
        </SheetHeader>

        {/* 탭 */}
        <div className="flex border-b border-[#E6EBF0] px-5">
          <button
            type="button"
            onClick={() => setTab('round')}
            className={`flex-1 relative h-11 inline-flex items-center justify-center gap-1.5 text-[14px] font-bold tracking-[-0.2px] transition-colors ${
              tab === 'round' ? 'text-[#272833]' : 'text-[#9EABBA]'
            }`}
          >
            <span>라운드 조건</span>
            {roundActive > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1.5 rounded-full inline-flex items-center justify-center text-[10px] font-bold tracking-[-0.1px] ${
                tab === 'round' ? 'bg-[#1AB277] text-white' : 'bg-[#F0F2F5] text-[#6A7683]'
              }`}>{roundActive}</span>
            )}
            {tab === 'round' && <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#272833]" />}
          </button>
          <button
            type="button"
            onClick={() => setTab('region')}
            className={`flex-1 relative h-11 inline-flex items-center justify-center gap-1.5 text-[14px] font-bold tracking-[-0.2px] transition-colors ${
              tab === 'region' ? 'text-[#272833]' : 'text-[#9EABBA]'
            }`}
          >
            <span>지역 선택</span>
            {regionActive > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1.5 rounded-full inline-flex items-center justify-center text-[10px] font-bold tracking-[-0.1px] ${
                tab === 'region' ? 'bg-[#1AB277] text-white' : 'bg-[#F0F2F5] text-[#6A7683]'
              }`}>{regionActive}</span>
            )}
            {tab === 'region' && <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#272833]" />}
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
          {tab === 'round' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-[14px] font-bold tracking-[-0.2px] mb-2 text-[#272833]">시간대</h3>
                <div className="flex gap-1.5">
                  {[
                    { id: '새벽', label: '새벽', sub: '~06:59' },
                    { id: '오전', label: '오전', sub: '07:00~11:59' },
                    { id: '오후', label: '오후', sub: '12:00~' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => toggle(timeSlots, setTimeSlots, t.id)}
                      className={`py-[8px] px-[12px] rounded-full text-[13px] font-medium transition-all flex items-center gap-1 border tracking-[-0.2px] whitespace-nowrap ${
                        timeSlots.includes(t.id)
                          ? 'border-[#393F48] text-[#272833]'
                          : 'border-[#D9E0E8] text-[#6A7683]'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className={`text-[10px] ${timeSlots.includes(t.id) ? 'text-[#6A7683]' : 'text-[#a4b3c4]'}`}>{t.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold tracking-[-0.2px] mb-2 text-[#272833]">플레이스타일</h3>
                <div className="flex flex-wrap gap-1.5">
                  {['셀프플레이','캐디포함','2인보장','쓰루플레이'].map(s => (
                    <button
                      key={s}
                      onClick={() => toggle(playStyles, setPlayStyles, s)}
                      className={`py-[8px] px-[12px] rounded-full text-[13px] font-medium transition-all border tracking-[-0.2px] ${
                        playStyles.includes(s)
                          ? 'border-[#393F48] text-[#272833]'
                          : 'border-[#D9E0E8] text-[#6A7683]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold tracking-[-0.2px] mb-2 text-[#272833]">포함사항</h3>
                <div className="flex flex-wrap gap-1.5">
                  {['중식포함','조식포함','숙박포함','카트포함','셔틀버스운영'].map(inc => (
                    <button
                      key={inc}
                      onClick={() => toggle(inclusions, setInclusions, inc)}
                      className={`py-[8px] px-[12px] rounded-full text-[13px] font-medium transition-all border tracking-[-0.2px] ${
                        inclusions.includes(inc)
                          ? 'border-[#393F48] text-[#272833]'
                          : 'border-[#D9E0E8] text-[#6A7683]'
                      }`}
                    >
                      {inc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-bold tracking-[-0.2px] text-[#272833]">플레이 요금</h3>
                  <span className="text-[10px] font-medium text-[#9EABBA] tracking-[-0.1px]">
                    적용 환율: 1¥ ≈ {EXCHANGE_RATE}원 ({EXCHANGE_RATE_DATE} 기준)
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-blue-600 font-semibold">¥{priceRange[0].toLocaleString()}</span>
                      <span className="text-[10px] text-[#9EABBA]">약 {formatKrw(jpyToKrw(priceRange[0]))}</span>
                    </div>
                    <span className="text-[#9EABBA] mt-1">~</span>
                    <div className="flex flex-col items-end">
                      <span className="text-blue-600 font-semibold">¥{priceRange[1].toLocaleString()}</span>
                      <span className="text-[10px] text-[#9EABBA]">약 {formatKrw(jpyToKrw(priceRange[1]))}</span>
                    </div>
                  </div>
                  <Slider min={PRICE_RANGE_MIN} max={PRICE_RANGE_MAX} step={1000} value={priceRange} onValueChange={setPriceRange} className="w-full" />
                  <div className="flex items-center justify-between text-xs text-[#9EABBA]">
                    <span>¥{PRICE_RANGE_MIN.toLocaleString()}</span>
                    <span>¥{PRICE_RANGE_MAX.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'region' && (
            <div className="space-y-5">
              <p className="text-[12px] font-medium text-[#6A7683] tracking-[-0.2px] leading-relaxed">
                "어디로"에서 고른 나라의 권역과 세부 지역(현·도시 등)을 선택해 검색 범위를 좁히세요.
              </p>

              {countryData.length === 0 && (
                <p className="text-[12px] font-medium text-[#9EABBA] tracking-[-0.2px] text-center py-6">
                  먼저 "어디로"에서 나라를 1개 이상 선택해 주세요
                </p>
              )}

              {countryData.map(country => (
                <div key={country.code} className="space-y-4">
                  <p className="text-[13px] font-bold text-[#272833] tracking-[-0.2px] flex items-center gap-1.5">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </p>

                  {/* 권역별 그룹 — 1차 권역 칩 + 그 아래 항상 하위 권역(2차) 칩까지 함께 노출 */}
                  {country.regions.map(region => {
                    // 표기 변형(예: 구마모토/쿠마모토) 합치기 — 먼저 등장한 토큰을 canonical 로
                    const seenVariants = new Set<string>();
                    const uniqueSubs: string[] = [];
                    for (const sub of region.subRegions) {
                      const variants = SUB_VARIANTS[sub] ?? [sub];
                      if (variants.some(v => seenVariants.has(v))) continue;
                      variants.forEach(v => seenVariants.add(v));
                      uniqueSubs.push(sub);
                    }
                    // 1차 칩 3-state: 모든 sub ON('all') / 일부 ON('partial') / 모두 OFF('off')
                    // uniqueSubs(중복 변형 제거) 기준으로 카운트해 "분자/분모" 단위 일치 (예: "6/7")
                    const selectedSubCount = uniqueSubs.filter(s => {
                      const variants = SUB_VARIANTS[s] ?? [s];
                      return variants.some(v => pendingSubs.includes(v));
                    }).length;
                    const regionState: 'all' | 'partial' | 'off' =
                      selectedSubCount === 0 ? 'off'
                      : selectedSubCount === uniqueSubs.length ? 'all'
                      : 'partial';
                    // line(black border) 통일 — all 과 partial 은 같은 톤, 우측 카운트("하위 N곳" vs "M/N") 로 구분
                    const regionChipClass =
                      regionState === 'off'
                        ? 'bg-white border-[#E6EBF0] text-[#9EABBA] font-medium'
                        : 'bg-white border-[#272833] text-[#272833] font-bold';
                    return (
                      <div key={`${country.code}:${region.id}`} className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleRegion(region.id)}
                            className={`inline-flex items-center gap-1 px-3 h-8 rounded-full text-[12px] font-bold tracking-[-0.2px] border transition-colors ${regionChipClass}`}
                            aria-pressed={regionState !== 'off'}
                            title={
                              regionState === 'all'
                                ? `${region.label} 전체 ON — 탭하면 일괄 해제`
                                : regionState === 'partial'
                                ? `${region.label} 부분 선택 — 탭하면 전체 ON`
                                : `${region.label} OFF — 탭하면 전체 ON`
                            }
                          >
                            {regionState !== 'off' && <Check className="w-3 h-3" strokeWidth={3} />}
                            {region.label}
                          </button>
                          <span className="text-[11px] font-medium text-[#9EABBA] tracking-[-0.2px]">
                            {regionState === 'partial'
                              ? `${selectedSubCount}/${uniqueSubs.length}`
                              : `하위 ${uniqueSubs.length}곳`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {uniqueSubs.map(sub => {
                            const variants = SUB_VARIANTS[sub] ?? [sub];
                            const subSel = variants.some(v => pendingSubs.includes(v));
                            return (
                              <button
                                key={`${country.code}:${region.id}:${sub}`}
                                type="button"
                                onClick={() => toggleSub(sub)}
                                className={`inline-flex items-center gap-1 px-2.5 h-7 rounded-full text-[11px] tracking-[-0.2px] border transition-colors ${
                                  subSel
                                    ? 'bg-white border-[#272833] text-[#272833] font-bold'
                                    : 'bg-white border-[#E6EBF0] text-[#9EABBA] font-medium'
                                }`}
                              >
                                {subSel && <Check className="w-3 h-3" strokeWidth={3} />}
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="px-4 py-4 bg-white border-t border-[#E6EBF0]">
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-[#D9E0E8] text-[#535D67] rounded-[8px] text-[13px] font-bold tracking-[-0.2px] hover:bg-[#F9FAFB]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {tab === 'round' ? '라운드 조건 초기화' : '지역 선택 초기화'}
            </button>
            {(() => {
              // 지역 선택 탭에서 1차 권역과 sub 가 모두 비어 있으면 Apply 비활성 — "전체"와 "전부 해제" 의미 충돌 방지
              const regionEmpty = tab === 'region' && pendingRegions.length === 0 && pendingSubs.length === 0;
              return (
                <button
                  onClick={apply}
                  disabled={regionEmpty}
                  className={`px-4 py-3 rounded-[8px] text-[14px] font-bold tracking-[-0.2px] shadow-sm transition-colors ${
                    regionEmpty
                      ? 'bg-[#F0F2F5] text-[#9EABBA] cursor-not-allowed'
                      : 'bg-[#1AB277] text-white hover:bg-[#149867]'
                  }`}
                  title={regionEmpty ? '권역을 1개 이상 선택해 주세요' : undefined}
                >
                  {regionEmpty ? '권역을 선택해 주세요' : '적용하기'}
                </button>
              );
            })()}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
