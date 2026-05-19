import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, ClipboardList, Search } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { LegalFooter } from './LegalFooter';

interface Props {
  children: ReactNode;
}

/**
 * v3 진입 화면. v2의 큐레이션 홈을 대체한다.
 *
 * 상단 구조:
 *   1) 슬림 헤더: 뒤로 / 타이틀(해외 골프 투어) / 예약내역 아이콘
 *   2) 탭바: [실시간 예약 | 패키지] — 활성 탭 underline
 *
 * 본문은 라우트별 페이지(RealtimeSearchPage 또는 PackagesSearchPage)가 children으로 들어온다.
 */
export function ExploreTabsPage({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const isRealtime = location.pathname.startsWith('/realtime') || location.pathname === '/';
  const isPackages = location.pathname.startsWith('/packages');

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-12">
      {/* 슬림 헤더 */}
      <div className="sticky top-0 z-50 bg-white">
        <div className="flex items-center h-12 px-3 border-b border-[#F0F2F5]">
          <button onClick={() => navigate(-1)} className="p-1.5" aria-label="뒤로가기">
            <ArrowLeft className="w-5 h-5 text-[#272833]" />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-bold text-[#272833] tracking-[-0.3px]">
            해외 골프 투어
          </h1>
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-1.5"
            aria-label="검색"
          >
            <Search className="w-5 h-5 text-[#272833]" />
          </button>
          <button
            onClick={() => navigate('/my-reservations')}
            className="p-1.5 inline-flex items-center gap-1"
            aria-label="예약내역"
          >
            <ClipboardList className="w-5 h-5 text-[#272833]" />
          </button>
        </div>

        {/* 상단 탭 */}
        <div className="flex border-b border-[#F0F2F5] bg-white">
          <button
            type="button"
            onClick={() => navigate('/realtime')}
            className={`flex-1 h-12 relative inline-flex items-center justify-center gap-1.5 text-[14px] font-bold tracking-[-0.2px] transition-colors ${
              isRealtime ? 'text-[#272833]' : 'text-[#9EABBA]'
            }`}
          >
            <span>⚡</span>
            <span>실시간 예약</span>
            {isRealtime && <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-12 h-[3px] rounded-t bg-[#1AB277]" />}
          </button>
          <button
            type="button"
            onClick={() => navigate('/packages')}
            className={`flex-1 h-12 relative inline-flex items-center justify-center gap-1.5 text-[14px] font-bold tracking-[-0.2px] transition-colors ${
              isPackages ? 'text-[#272833]' : 'text-[#9EABBA]'
            }`}
          >
            <span>🎁</span>
            <span>패키지</span>
            {isPackages && <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-12 h-[3px] rounded-t bg-[#1AB277]" />}
          </button>
        </div>
      </div>

      {/* 본문 */}
      {children}

      <LegalFooter />
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}
