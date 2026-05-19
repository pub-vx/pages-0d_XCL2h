import { useNavigate } from 'react-router';
import { MapPin, Star, ChevronRight } from 'lucide-react';
import { mockCourses, formatJpy, formatKrw, jpyToKrw } from '../data/mockData';

/** MD 추천 사유 — 시드 데이터의 모든 '추천' 태그 코스에 매핑. 누락 시 fallback 사유 사용 */
const MD_REASONS: Record<string, string> = {
  koga: '가성비 최강! 나리타 40분',
  century: '명문 코스 · 접근성 최고',
  kasumigaseki: '올림픽 개최지 · 프리미엄',
  abiko: '도심 접근성 · 초보자 추천',
  taiheiyo: '바다뷰 명문 · 프로 대회 코스',
  narita: '공항 10분 · 도착 당일 라운드',
  sakura: '벚꽃 코스 · 봄 시즌 인기',
  seve: '세베 바예스테로스 설계',
  fuji: '후지산 뷰 · 사계절 인기',
  sunrise: '규슈 대표 · 온천 료칸 연계',
  'osaka-tower': '오사카 시내 직결 · 야경 명문',
  'tokyo-bay': '도쿄 베이뷰 · 하네다 30분',
  'yokohama-royal': '요코하마 명문 · 챔피언십 코스',
  'kobe-bay': '고베 베이뷰 · 시내 직결',
  'niseko-royal': '리조트 명문 · 자작나무 코스',
};

const FALLBACK_REASON = 'MD가 직접 골라드린 추천 코스';

/**
 * MD 추천 상품 — 광고(추천) 노출 영역.
 * 가로 스크롤 카드 리스트. 이미지·랭킹·MD 사유·지역·평점·가격 노출.
 */
export function MDPicks() {
  const navigate = useNavigate();
  const recommended = mockCourses.filter(c => c.tags?.includes('추천')).slice(0, 10);

  return (
    <div className="py-5 bg-white">
      <div className="px-5 mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="text-[16px] font-bold text-[#272833] tracking-[-0.3px]">실시간 일본! MD 추천 상품</h2>
          <span className="px-1.5 py-0.5 bg-[#F0F2F5] text-[#535D67] rounded-[4px] text-[10px] font-bold tracking-[-0.1px]">
            AD
          </span>
        </div>
        <button
          onClick={() => navigate('/search')}
          className="flex items-center text-[#9EABBA] flex-shrink-0 text-[13px] font-medium tracking-[-0.2px]"
        >
          전체보기 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
        {recommended.map(course => (
          <button
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            className="flex-shrink-0 w-[200px] text-left"
          >
            <div className="rounded-[8px] overflow-hidden mb-2">
              <img src={course.image} alt={course.name} className="w-full h-[130px] object-cover" />
            </div>
            <h4 className="text-[14px] font-bold text-[#272833] tracking-[-0.2px] truncate">{course.name}</h4>
            <p className="text-[13px] font-semibold text-[#1AB277] tracking-[-0.2px] mt-0.5 truncate">
              {MD_REASONS[course.id] ?? FALLBACK_REASON}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#9EABBA]" />
              <span className="text-[13px] font-medium text-[#6A7683] tracking-[-0.2px]">{course.region}</span>
              <span className="text-[#D9E0E8] text-[13px]">|</span>
              <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
              <span className="text-[13px] font-medium text-[#6A7683] tracking-[-0.2px]">{course.rating}</span>
            </div>
            <p className="text-[15px] font-bold text-[#272833] tracking-[-0.2px] mt-1">
              {formatJpy(course.lowestPrice)}~
            </p>
            <p className="text-[12px] font-medium text-[#9EABBA] tracking-[-0.2px]">
              약 {formatKrw(jpyToKrw(course.lowestPrice))}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
