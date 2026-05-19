import { MapPin, Copy, Phone, Map } from 'lucide-react';
import { toast } from 'sonner';
import type { GolfCourse } from '../../data/mockData';
import { formatCourseDistance } from '../../lib/geo';

interface CourseInfoTabProps {
  course: GolfCourse;
}

export function CourseInfoTab({ course }: CourseInfoTabProps) {
  const copyAddress = () => {
    navigator.clipboard?.writeText(course.addressLocal);
    toast.success('주소가 복사되었습니다');
  };

  return (
    <div>
      {/* 지도 placeholder */}
      <div className="w-full h-44 bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-[#1AB277] mx-auto mb-1" />
          <p className="text-[12px] text-[#9EABBA]">지도 영역</p>
        </div>
      </div>

      {/* 골프장명 */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-[16px] font-bold text-[#272833]">{course.name}</h3>
      </div>

      {/* 액션 버튼 — 전화 / 지도에서 보기 */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 border border-[#D9E0E8] rounded-[8px] overflow-hidden">
          <button className="flex flex-col items-center justify-center py-3 gap-1.5 border-r border-[#D9E0E8]">
            <Phone className="w-5 h-5 text-[#272833]" />
            <span className="text-[13px] text-[#272833] font-medium">전화</span>
          </button>
          <button className="flex flex-col items-center justify-center py-3 gap-1.5">
            <Map className="w-5 h-5 text-[#272833]" />
            <span className="text-[13px] text-[#272833] font-medium">지도에서 보기</span>
          </button>
        </div>
      </div>

      {/* 기본 정보 테이블 */}
      <div className="border-t border-[#D9E0E8]">
        <InfoRow label="주소">
          <div>
            <p className="text-[13px] text-[#272833]">{course.address}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[12px] text-[#6A7683]">{course.addressLocal}</p>
              <button
                onClick={copyAddress}
                className="flex items-center gap-0.5 text-[11px] text-[#448FFF]"
              >
                <Copy className="w-3 h-3" /> 복사
              </button>
            </div>
          </div>
        </InfoRow>
        <InfoRow label="교통">
          <span className="text-[13px] text-[#272833]">{formatCourseDistance(course)}</span>
        </InfoRow>
        {course.courseDesigner && (
          <InfoRow label="설계">
            <span className="text-[13px] text-[#272833]">{course.courseDesigner}</span>
          </InfoRow>
        )}
        <InfoRow label="구분">
          <span className="text-[13px] text-[#272833]">{course.courseGrade || '대중형'}</span>
        </InfoRow>
        <InfoRow label="규모">
          <span className="text-[13px] text-[#272833]">{course.holes}홀 / Par {course.par}</span>
        </InfoRow>
        {course.koreanSupport && (
          <InfoRow label="한국어 대응">
            <span className="text-[13px] text-[#272833]">{course.koreanSupport}</span>
          </InfoRow>
        )}
      </div>

      {/* 에티켓 가이드 */}
      {course.etiquette && (
        <div className="border-t border-[#D9E0E8] px-4 py-4">
          <h3 className="text-[14px] font-bold text-[#272833] mb-3">에티켓 가이드</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">👔</span>
                <span className="text-[13px] font-semibold text-[#272833]">드레스코드</span>
              </div>
              {course.etiquette.dressCode.map((item, i) => (
                <p key={i} className="text-[12px] text-[#6A7683] ml-6 mb-0.5">{item}</p>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">🍽️</span>
                <span className="text-[13px] font-semibold text-[#272833]">식사</span>
              </div>
              <p className="text-[12px] text-[#6A7683] ml-6">{course.etiquette.dining}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">💬</span>
                <span className="text-[13px] font-semibold text-[#272833]">유용한 일본어 표현</span>
              </div>
              <div className="ml-6 space-y-1">
                {course.etiquette.phrases.map((phrase, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="text-[#9EABBA] w-16">{phrase.label}:</span>
                    <span className="text-[#393F48] font-medium">{phrase.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 드레스코드 간단 버전 */}
      {course.dressCode && !course.etiquette && (
        <InfoRow label="드레스코드">
          <span className="text-[13px] text-[#272833]">{course.dressCode}</span>
        </InfoRow>
      )}

      {/* 취소·환불 */}
      <div className="border-t border-[#D9E0E8] px-4 py-4">
        <h3 className="text-[14px] font-bold text-[#272833] mb-3">취소·환불 안내</h3>
        <div className="bg-[#F2FDF7] border border-[#E0F7ED] rounded-[8px] p-3 mb-3">
          <p className="text-[13px] font-semibold text-[#149867]">
            지금 예약하면, 7일 전까지 무료 취소 가능!
          </p>
        </div>
        <div className="space-y-2">
          {course.plans[0]?.cancellationPolicy.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[13px]">
              <span className="text-[#6A7683]">• {item.label}</span>
              <span className={`font-medium ${item.fee === '전액 환불' ? 'text-[#1AB277]' : 'text-[#EA5656]'}`}>
                {item.fee}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-[8px]">
          <p className="text-[11px] text-amber-700">
            우천 시에도 골프장 취소 정책이 적용됩니다. 여행자 보험 가입을 권장드려요.
          </p>
        </div>
      </div>

      {/* 골프장에서 알립니다 */}
      <div className="bg-[#F9FAFB] px-4 py-5">
        <h3 className="text-[15px] font-bold text-[#1AB277] mb-3">골프장에서 알립니다!</h3>
        <div className="space-y-3 text-[13px] text-[#393F48] leading-relaxed">
          <p>
            <span className="text-[#EA5656] font-medium">■ 최종 결제금액은 세금·시설이용료 포함 금액입니다.</span>
          </p>
          <div>
            <p className="font-medium">■ 이용 안내</p>
            <p className="text-[#6A7683]">- 플랜별 포함사항을 반드시 확인해주세요.</p>
            <p className="text-[#6A7683]">- 예약 후 변경은 취소 후 재예약이 필요합니다.</p>
          </div>
          <div>
            <p className="font-medium">■ 캐디 운영 안내</p>
            <p className="text-[#6A7683]">- 셀프플레이 또는 캐디 동반 여부는 플랜에 따라 다릅니다.</p>
            <p className="text-[#6A7683]">- 캐디피는 현장 결제입니다.</p>
          </div>
          <p className="text-[11px] text-[#9EABBA] mt-2">
            ※ 상기 내용은 골프장 사정에 따라 변동될 수 있습니다.<br />
            상세 문의는 골프장에 확인해 주시기 바랍니다.
          </p>
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="h-8" />
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex px-4 py-3 border-b border-[#F0F2F5]">
      <span className="text-[13px] text-[#6A7683] w-[72px] flex-shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
