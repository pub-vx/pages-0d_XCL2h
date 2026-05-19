import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { ExploreTabsPage } from './ExploreTabsPage';
// SearchInputCard: 패키지 탭에서는 임시 비노출 — 추후 실시간 탭과 통합 검색 도입 시 재활성
// import { SearchInputCard } from './SearchInputCard';
import { PACKAGE_SLOTS, type AdSlot } from '../data/packages';
import { COUNTRIES } from '../lib/countries';

/**
 * v3 패키지 탭 화면.
 *
 * 구성 (위→아래):
 *  1) SearchInputCard + 검색 CTA (실시간 탭과 동일 형태)
 *  2) 광고 영역 안내
 *  3) 나라별 섹션 — 헤더(국기·나라명·대표 상품 N개) + 패키지 카드 가로/세로 리스트
 *  4) 카드 클릭 시 외부 제휴사 페이지로 outlink (새 창)
 */

function openExternalPartner(slot: AdSlot) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(slot.advertiser + ' ' + slot.title)}`;
  toast.info(`${slot.advertiser} 외부 페이지로 이동해요`, {
    description: '제휴사 사이트에서 상세 일정과 예약을 진행할 수 있어요',
    duration: 2500,
    position: 'top-center',
  });
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * 패키지 카드 — 제휴사 / 상품명 / 해시태그 / 상품 속성 / 가격 4단 구조.
 * 이미지는 우상단 사각 썸네일로 컴팩트. 카드 자체가 외부 제휴사 이동 트리거.
 */
function PackageCard({ slot }: { slot: AdSlot }) {
  return (
    <button
      type="button"
      onClick={() => openExternalPartner(slot)}
      className="w-full text-left bg-white rounded-[10px] border border-[#E6EBF0] overflow-hidden shadow-sm hover:border-[#1AB277] transition-colors"
    >
      <div className="flex gap-3 p-3">
        {/* 좌측 썸네일 */}
        <div
          className="relative flex-shrink-0 w-24 h-24 rounded-[8px] bg-cover bg-center"
          style={{ backgroundImage: `url(${slot.image})` }}
        >
          {slot.badge && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#D6385A] text-white rounded-[4px] text-[9px] font-bold tracking-[-0.1px]">
              {slot.badge}
            </div>
          )}
        </div>

        {/* 우측 정보 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 1) 제휴사명 + AD 뱃지 */}
          <div className="inline-flex items-center gap-1 mb-1">
            <span className="text-[11px] leading-none">{slot.partnerLogo}</span>
            <span className="text-[11px] font-bold text-[#535D67] tracking-[-0.2px]">{slot.advertiser}</span>
            <span className="ml-0.5 px-1 bg-[#F0F2F5] text-[#535D67] rounded-[2px] text-[9px] font-bold tracking-[-0.1px]">AD</span>
            {slot.tagline && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#FFF4E5] text-[#D6385A] rounded-[3px] text-[9px] font-bold tracking-[-0.1px]">
                🔥 {slot.tagline}
              </span>
            )}
          </div>

          {/* 2) 상품명 — 해시태그가 인라인으로 포함됨 */}
          <p className="text-[14px] font-bold text-[#272833] tracking-[-0.3px] leading-snug inline-flex items-start gap-1 break-keep">
            <span className="flex-1">{slot.title}</span>
            <ExternalLink className="w-3 h-3 mt-0.5 text-[#9EABBA] flex-shrink-0" />
          </p>
        </div>
      </div>

      {/* 3) 상품 속성 (전체 폭) */}
      {slot.attributes && slot.attributes.length > 0 && (
        <p className="px-3 pb-2 text-[11px] font-medium text-[#6A7683] tracking-[-0.2px]">
          {slot.attributes.join(' · ')}
        </p>
      )}

      {/* 4) 금액 */}
      <div className="px-3 pb-3 pt-1 border-t border-[#F0F2F5] flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] text-[#9EABBA] line-through tracking-[-0.2px]">{slot.originalPrice}</span>
          <span className="text-[13px] font-bold text-[#D6385A] tracking-[-0.2px]">{slot.discount}</span>
        </div>
        <span className="text-[18px] font-bold text-[#272833] tracking-[-0.4px]">{slot.price}</span>
      </div>
    </button>
  );
}

/** id 규칙 — 국가 탭 클릭 시 scrollIntoView 타겟 */
const pkgSectionId = (code: string) => `pkg-section-${code}`;

/** 나라별 패키지 묶음 헤더 + 카드 리스트 */
function CountrySection({ countryCode }: { countryCode: string }) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return null;
  const slots = PACKAGE_SLOTS.filter(s => s.country === countryCode);
  if (slots.length === 0) return null;
  return (
    // scroll-mt 로 sticky 헤더(96px) + 국가 탭바(44px) 만큼 오프셋 — anchor 점프 시 상단 가림 방지
    <section id={pkgSectionId(countryCode)} className="px-4 pt-5 pb-2 bg-white scroll-mt-[140px]">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[16px] font-bold text-[#272833] tracking-[-0.3px] flex items-center gap-1.5">
          <span>{country.flag}</span>
          <span>{country.name}</span>
          <span className="text-[12px] font-medium text-[#9EABBA] tracking-[-0.2px] ml-0.5">패키지 {slots.length}</span>
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        {slots.map(s => <PackageCard key={s.id} slot={s} />)}
      </div>
    </section>
  );
}

/**
 * 국가 탭 스트립 — sticky 로 상단 [실시간/패키지] 탭 바로 아래에 고정.
 * 탭 탭 시 해당 국가 섹션으로 scrollIntoView (smooth).
 * 패키지가 0건인 국가는 탭에서 숨김.
 *
 * 활성 chip 추적: IntersectionObserver 로 현재 viewport 의 상단 띠(sticky 헤더 아래) 에
 * 가장 가까운 섹션을 활성으로 표시. 클릭 시 즉시 activeCountry 갱신 + smooth scroll.
 */
function CountryTabStrip() {
  const visibleCountries = COUNTRIES.filter(c => PACKAGE_SLOTS.some(s => s.country === c.code));
  const [activeCountry, setActiveCountry] = useState<string>(visibleCountries[0]?.code ?? 'jp');
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // 클릭으로 막 점프했을 때 IntersectionObserver 발화가 흔들리는 걸 잠깐 무시
  const lockUntilRef = useRef<number>(0);

  useEffect(() => {
    const sections = visibleCountries
      .map(c => document.getElementById(pkgSectionId(c.code)))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        if (Date.now() < lockUntilRef.current) return;
        // viewport (sticky 헤더 140px 아래 ~ 하단 50%) 안에 있는 섹션 중 가장 큰 비중을 차지하는 것 활성
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const code = visible[0].target.id.replace('pkg-section-', '');
          setActiveCountry(code);
        }
      },
      { rootMargin: '-140px 0px -50% 0px', threshold: [0, 0.1, 0.25, 0.5, 1] },
    );

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [visibleCountries.length]);

  // 활성 chip 이 strip 밖으로 나가지 않도록 자동 정렬
  useEffect(() => {
    const btn = chipRefs.current[activeCountry];
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCountry]);

  const handleClick = (code: string) => {
    setActiveCountry(code); // 클릭 즉시 활성 chip 갱신 (관찰자 지연 회피)
    lockUntilRef.current = Date.now() + 600; // smooth scroll 도착 전 IO 발화 무시
    const el = document.getElementById(pkgSectionId(code));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="sticky top-24 z-40 bg-white border-b border-[#F0F2F5]">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide px-3 py-2">
        {visibleCountries.map(c => {
          const active = c.code === activeCountry;
          return (
            <button
              key={c.code}
              ref={el => { chipRefs.current[c.code] = el; }}
              type="button"
              onClick={() => handleClick(c.code)}
              className={`flex-shrink-0 inline-flex items-center gap-1 px-3 h-8 rounded-full border text-[13px] tracking-[-0.2px] transition-colors ${
                active
                  ? 'bg-white border-[#272833] text-[#272833] font-bold'
                  : 'bg-white border-[#E6EBF0] text-[#9EABBA] font-medium hover:bg-[#F9FAFB]'
              }`}
              aria-current={active ? 'true' : undefined}
            >
              <span className="text-[14px] leading-none">{c.flag}</span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PackagesSearchPage() {
  return (
    <ExploreTabsPage>
      {/* 어디로 / 언제 / 인원수 / 검색 — 패키지 탭에서는 임시 비노출 */}
      {/* <SearchInputCard showSearchButton /> */}

      {/* 국가 탭 스트립 — 클릭 시 해당 국가 섹션으로 스크롤 이동 */}
      <CountryTabStrip />

      {/* 광고 영역 안내 */}
      <div className="bg-white px-4 py-3 mt-1">
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#F2FDF7] rounded-[4px] mb-1.5">
          <Megaphone className="w-3 h-3 text-[#149867]" />
          <span className="text-[10px] font-bold text-[#149867] tracking-[-0.1px]">제휴 광고 영역</span>
        </div>
        <p className="text-[13px] text-[#393F48] tracking-[-0.2px] leading-snug">
          여행사·항공사·골프장이 일정 기간 등록한 <span className="font-bold">기간 한정 패키지</span>예요.
          카드 탭 시 제휴사 사이트로 이동합니다.
        </p>
      </div>

      {/* 나라별 섹션 */}
      {COUNTRIES.map(c => <CountrySection key={c.code} countryCode={c.code} />)}

      <div className="h-6 bg-white" />
    </ExploreTabsPage>
  );
}
