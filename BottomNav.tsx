import { useState, useEffect } from 'react';
import { List, Map as MapIcon, ClipboardList } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

/**
 * 카카오골프예약 메인 앱과 통일된 스타일의 플로팅 필 네비게이션
 *
 * 해외투어 탭은 토글로 동작:
 * - 활성 상태(`/` 또는 `/map`)에서 한 번 더 누르면 다른 모드로 전환
 *   (`/` ↔ `/map`)
 * - 활성 상태에서 위쪽에 "한 번 더 눌러 ___" 툴팁이 떠 모드 전환을 안내
 * - 라벨은 현재 모드를 표시: 목록 모드→"목록보기", 지도 모드→"지도보기"
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tooltipVisible, setTooltipVisible] = useState(true);

  const isListMode = location.pathname === '/search';
  const isMapMode = location.pathname === '/map';
  const isTourActive = isListMode || isMapMode;
  const isReservationActive = location.pathname === '/my-reservations';
  const isHome = location.pathname === '/';

  // 바텀 내비를 숨길 경로 (상세/결제/완료/가이드 등 몰입 페이지)
  const hiddenPrefixes = ['/course/', '/checkout/', '/complete/', '/booked/', '/beginner-guide', '/daytrip', '/flight-search', '/event/', '/packages', '/recommend', '/cart/', '/faq', '/search', '/map', '/my-reservations'];
  const shouldHide = hiddenPrefixes.some(p => location.pathname.startsWith(p)) || isHome;

  // 모드 전환 시 툴팁 다시 띄우고 5초 후 숨김
  useEffect(() => {
    if (isTourActive) {
      setTooltipVisible(true);
      const t = setTimeout(() => setTooltipVisible(false), 5000);
      return () => clearTimeout(t);
    }
  }, [location.pathname, isTourActive]);

  const handleTourClick = () => {
    if (!isTourActive) {
      navigate('/search');
      return;
    }
    // 토글: 목록 ↔ 지도. 지도 → 목록 전환 시 fromMap 플래그로 공항 컨텍스트 유지
    if (isMapMode) {
      navigate('/search', { state: { fromMap: true } });
    } else {
      navigate('/map');
    }
  };

  const handleReservationClick = () => navigate('/my-reservations');

  if (shouldHide) return null;

  const tourLabel = isMapMode ? '지도보기' : '목록보기';
  const tourIcon = isMapMode ? MapIcon : List;
  const TourIcon = tourIcon;
  const tooltipText = `한 번 더 눌러 ${isMapMode ? '목록' : '지도'}보기`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9997] flex justify-center pointer-events-none">
      <div className="w-full max-w-[430px] relative pointer-events-none">
        {/* 알약 네비 */}
        <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-4 bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-[#E6EBF0] flex items-center px-2 py-1.5">
          <div className="relative">
            {/* 툴팁 — 버튼 중심 기준 정렬 */}
            {isTourActive && tooltipVisible && (
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-10">
                <div className="relative px-3 py-1.5 bg-[#272833] text-white text-[11px] font-medium rounded-full shadow-lg whitespace-nowrap">
                  {tooltipText}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#272833] rotate-45" />
                </div>
              </div>
            )}
            <button
              onClick={handleTourClick}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                isTourActive
                  ? 'bg-[#272833] text-white shadow-sm'
                  : 'text-[#9EABBA] hover:text-[#6A7683]'
              }`}
            >
              <TourIcon className="w-4 h-4" strokeWidth={2.5} />
              <span>{tourLabel}</span>
            </button>
          </div>
          <button
            onClick={handleReservationClick}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              isReservationActive
                ? 'bg-[#272833] text-white shadow-sm'
                : 'text-[#9EABBA] hover:text-[#6A7683]'
            }`}
          >
            <ClipboardList className="w-4 h-4" strokeWidth={2.5} />
            <span>예약내역</span>
          </button>
        </div>
      </div>
    </div>
  );
}
