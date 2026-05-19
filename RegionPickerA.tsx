import { useState, useEffect, useMemo, useRef } from 'react';
import { Check } from 'lucide-react';
import { COUNTRIES } from '../../lib/countries';
import { toggleInArray } from '../../lib/selection';
import { useAppState } from '../../data/store';
import { mockCourses } from '../../data/mockData';
import { buildOverseasCourses } from '../../data/overseasCourses';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 어디로(권역) 선택 바텀시트.
 *
 * UX 규칙:
 *  - 나라 추가: 그 나라의 모든 권역을 자동 선택 (사용자가 명시적으로 해제 가능)
 *  - 나라 해제: 그 나라의 권역/하위지역 자동 정리
 *  - 나라 추가 시 본문 스크롤이 해당 나라 섹션으로 자동 이동 (가시성 확보)
 *  - 2차 권역(현·도시) 필터는 본 시트에서 분리되어 FilterSheet "지역 선택" 탭에서 제공
 *
 * 레이아웃: DateSheet와 동일한 ui/Sheet 패턴 (X 자동 우상단, 좌측 타이틀, 풋터 CTA)
 */
export function RegionPickerA({ open, onOpenChange }: Props) {
  const {
    selectedCountries, setSelectedCountries,
    selectedRegions, setSelectedRegions,
    selectedSubRegions, setSelectedSubRegions,
  } = useAppState();

  const [pendingCountries, setPendingCountries] = useState<string[]>(selectedCountries);
  const [pendingRegions, setPendingRegions] = useState<string[]>(selectedRegions);

  // 스크롤 컨테이너 + 각 나라 섹션 ref (나라 추가 시 자동 스크롤용)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const countrySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 시트 열릴 때마다 외부 store 값으로 동기화 (DateSheet 패턴)
  // selectedRegions 가 빈 배열이면 "필터 없음(전체)" 의미 — 시각화 시에는
  // 그 나라의 모든 권역을 체크된 상태로 노출해야 사용자가 현재 상태를 이해할 수 있음
  useEffect(() => {
    if (open) {
      setPendingCountries(selectedCountries);
      if (selectedRegions.length === 0) {
        const country = COUNTRIES.find(c => c.code === (selectedCountries[0] ?? 'jp'));
        setPendingRegions(country ? country.regions.map(r => r.id) : []);
      } else {
        setPendingRegions(selectedRegions);
      }
    }
  }, [open, selectedCountries, selectedRegions]);

  // (국가, 1차 권역) → 골프장 수 집계
  //  - 일본(mockCourses) 의 c.region 은 prefecture 명 (예: '후쿠오카')
  //  - 해외(overseasCourses) 의 c.region 은 "북부 · 하노이" 형태
  //  - 두 케이스 모두 c.region 또는 c.address 에 subRegion 문자열이 포함되어 있으면 매칭
  //    → 일본과 동일한 매칭 규칙(isCourseInCountryRegions)을 그대로 따른다
  const regionCounts = useMemo(() => {
    const all = [...mockCourses, ...buildOverseasCourses()];
    const map: Record<string, number> = {};
    for (const c of all) {
      const courseCountry = c.country ?? 'jp';
      const country = COUNTRIES.find(cc => cc.code === courseCountry);
      if (!country) continue;
      for (const r of country.regions) {
        // 해외 코스: c.region 이 곧 1차 권역 id ('북부' 등) → 직접 비교 우선
        // 일본 코스: c.region 이 prefecture → subRegions 포함 검사
        const matched = c.region === r.id
          || r.subRegions.some(sub =>
            (c.region && c.region.includes(sub))
            || (c.subRegion && c.subRegion.includes(sub))
            || (c.address && c.address.includes(sub))
          );
        if (matched) {
          // 키를 country.code:regionId 로 두면 동명(예: 베트남'북부' vs 대만'북부') 충돌을 막을 수 있음
          const key = `${country.code}:${r.id}`;
          map[key] = (map[key] || 0) + 1;
        }
      }
    }
    return map;
  }, []);

  // 단일 선택 — 칩 탭 시 그 나라로 교체. 동일 칩 재탭은 무시 (해제 없음 — 최소 1개 유지)
  const selectCountry = (code: string) => {
    if (pendingCountries[0] === code) return;
    const country = COUNTRIES.find(c => c.code === code);
    if (!country) return;
    const newRegionIds = country.regions.map(r => r.id);
    setPendingCountries([code]);
    setPendingRegions(newRegionIds); // 그 나라의 모든 권역 자동 선택
    // 다음 페인트 후 해당 나라 섹션으로 스크롤
    requestAnimationFrame(() => {
      const section = countrySectionRefs.current[code];
      const container = scrollContainerRef.current;
      if (section && container) {
        const sectionTop = section.offsetTop - container.offsetTop;
        container.scrollTo({ top: sectionTop - 12, behavior: 'smooth' });
      }
    });
  };

  const toggleRegion = (id: string) => {
    setPendingRegions(prev => toggleInArray(prev, id));
  };

  // 초기화 — 기본 나라(일본)로 되돌리고 그 나라의 모든 권역 자동 선택
  const resetAll = () => {
    const jp = COUNTRIES.find(c => c.code === 'jp');
    setPendingCountries(['jp']);
    setPendingRegions(jp ? jp.regions.map(r => r.id) : []);
  };

  const handleConfirm = () => {
    setSelectedCountries(pendingCountries);
    setSelectedRegions(pendingRegions);
    // 권역 변경 시 2차 권역도 허용 범위로 정리
    if (pendingRegions.length === 0) {
      setSelectedSubRegions([]);
    } else {
      const allowedSubs = new Set(
        COUNTRIES.flatMap(c => c.regions.filter(r => pendingRegions.includes(r.id)).flatMap(r => r.subRegions))
      );
      setSelectedSubRegions(selectedSubRegions.filter(s => allowedSubs.has(s)));
    }
    onOpenChange(false);
  };

  const selectedCountryData = COUNTRIES.filter(c => pendingCountries.includes(c.code));

  // CTA 라벨 — 단일 나라 모델
  let ctaLabel: string;
  if (selectedCountryData.length === 0) {
    ctaLabel = '나라를 선택해 주세요';
  } else {
    const country = selectedCountryData[0];
    const allRegionsForCountry = country.regions.map(r => r.id);
    const selInThis = pendingRegions.filter(r => allRegionsForCountry.includes(r));
    const isAllRegions = selInThis.length === 0 || selInThis.length === allRegionsForCountry.length;
    ctaLabel = isAllRegions
      ? `${country.name} 전체로 검색`
      : `${selInThis.length}개 권역으로 검색`;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[88vh] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#E6EBF0]">
          <SheetTitle className="text-[16px] font-bold text-[#272833] tracking-[-0.3px] text-left">어디로 떠나시나요?</SheetTitle>
        </SheetHeader>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {/* 나라 다중 선택 칩 */}
          <div className="px-5 pt-4 pb-3 border-b border-[#F0F2F5]">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[13px] font-bold text-[#272833] tracking-[-0.2px]">나라 선택</p>
              <button
                type="button"
                onClick={resetAll}
                className="text-[12px] font-medium text-[#6A7683] tracking-[-0.2px]"
              >
                초기화
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map(c => {
                const isSel = pendingCountries.includes(c.code);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => selectCountry(c.code)}
                    className={`inline-flex items-center gap-1 px-3 h-9 rounded-full text-[13px] tracking-[-0.2px] border transition-colors ${
                      isSel
                        ? 'bg-white border-[#272833] text-[#272833] font-bold'
                        : c.available ? 'bg-white border-[#E6EBF0] text-[#9EABBA] font-medium' : 'bg-[#F9FAFB] border-[#E6EBF0] text-[#9EABBA] font-medium'
                    }`}
                  >
                    <span className="text-[14px] leading-none">{c.flag}</span>
                    <span>{c.name}</span>
                    {!c.available && !isSel && (
                      <span className="ml-0.5 text-[10px] font-bold text-[#9EABBA] tracking-[-0.1px]">·준비중</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 나라별 권역 행 리스트 */}
          <div className="pt-3 pb-2">
            <div className="flex items-baseline justify-between px-5 mb-1.5">
              <p className="text-[13px] font-bold text-[#272833] tracking-[-0.2px]">권역으로 찾기</p>
              <p className="text-[11px] font-medium text-[#9EABBA] tracking-[-0.2px]">여러 권역 선택 가능</p>
            </div>

            {selectedCountryData.length === 0 && (
              <p className="px-5 py-6 text-[12px] font-medium text-[#9EABBA] tracking-[-0.2px] text-center">
                먼저 나라를 1개 이상 선택해 주세요
              </p>
            )}

            {selectedCountryData.map(country => (
              <div
                key={country.code}
                ref={el => { countrySectionRefs.current[country.code] = el; }}
                className="mb-2 last:mb-0"
              >
                <p className="px-5 pt-3 pb-1.5 text-[12px] font-bold text-[#535D67] tracking-[-0.2px] flex items-center gap-1.5">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  {!country.available && (
                    <span className="px-1.5 py-0.5 bg-[#F0F2F5] rounded-[4px] text-[10px] font-bold text-[#9EABBA] tracking-[-0.1px]">준비중</span>
                  )}
                </p>
                {country.regions.map(r => {
                  const isSel = pendingRegions.includes(r.id);
                  const count = regionCounts[`${country.code}:${r.id}`] || 0;
                  return (
                    <button
                      key={`${country.code}:${r.id}`}
                      type="button"
                      onClick={() => toggleRegion(r.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-[#F0F2F5] text-left transition-colors ${
                        isSel ? 'bg-[#F2FDF7]' : 'hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSel ? 'bg-[#1AB277]' : 'border-2 border-[#D9E0E8]'
                      }`}>
                        {isSel && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`flex-1 text-[14px] tracking-[-0.2px] truncate ${isSel ? 'font-bold text-[#272833]' : 'font-medium text-[#272833]'}`}>
                        {r.label}
                      </span>
                      <span className="text-[12px] font-medium text-[#9EABBA] tracking-[-0.2px] flex-shrink-0">{count}개</span>
                    </button>
                  );
                })}
              </div>
            ))}

            <p className="px-5 pt-4 text-[11px] font-medium text-[#9EABBA] tracking-[-0.2px] leading-relaxed">
              세부 지역(현·도시 등 2차 권역)은 우상단 <span className="font-bold text-[#535D67]">필터 → 지역 선택</span>에서 좁힐 수 있어요.
            </p>
          </div>
        </div>

        <div className="border-t border-[#E6EBF0] p-4 bg-white">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pendingCountries.length === 0}
            className={`w-full py-3.5 rounded-[8px] text-[14px] font-bold tracking-[-0.2px] transition-colors ${
              pendingCountries.length === 0
                ? 'bg-[#F0F2F5] text-[#9EABBA] cursor-not-allowed'
                : 'bg-[#1AB277] hover:bg-[#149867] text-white'
            }`}
          >
            {ctaLabel}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
