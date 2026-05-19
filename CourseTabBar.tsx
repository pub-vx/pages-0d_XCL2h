export type CourseTab = 'teetime' | 'info';

interface CourseTabBarProps {
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
}

const TABS: { key: CourseTab; label: string }[] = [
  { key: 'teetime', label: '티타임' },
  { key: 'info', label: '골프장 정보' },
];

export function CourseTabBar({ activeTab, onTabChange }: CourseTabBarProps) {
  return (
    <div className="sticky top-12 z-40 bg-white border-b border-[#D9E0E8]">
      <div className="flex">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 py-3 text-[14px] font-medium text-center transition-colors relative ${
              activeTab === tab.key
                ? 'text-[#272833] font-bold'
                : 'text-[#9EABBA]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#272833]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
