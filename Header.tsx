import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export function Header({ title, showBack = true }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-[#E6EBF0]">
      <div className="flex items-center h-12 px-4">
        {showBack && (
          <button onClick={() => navigate(-1)} className="mr-3 -ml-1 p-1">
            <ArrowLeft className="w-5 h-5 text-[#535D67]" />
          </button>
        )}
        <h1 className="text-base font-semibold text-[#272833] truncate">{title}</h1>
      </div>
    </div>
  );
}
