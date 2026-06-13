type QuickCity = {
  name: string;
  query: string;
  flag: string;
};

interface CityQuickSelectorProps {
  currentCityName: string;
  onSelectCity: (cityQuery: string) => void;
  accentClass: string;
}

const POPULAR_CITIES: QuickCity[] = [
  { name: "서울", query: "Seoul", flag: "🇰🇷" },
  { name: "부산", query: "Busan", flag: "🇰🇷" },
  { name: "제주", query: "Jeju", flag: "🇰🇷" },
  { name: "인천", query: "Incheon", flag: "🇰🇷" },
  { name: "도쿄", query: "Tokyo", flag: "🇯🇵" },
  { name: "뉴욕", query: "New York", flag: "🇺🇸" },
  { name: "런던", query: "London", flag: "🇬🇧" },
  { name: "파리", query: "Paris", flag: "🇫🇷" },
];

export default function CityQuickSelector({
  currentCityName,
  onSelectCity,
  accentClass
}: CityQuickSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">주요 도시 바로가기</h3>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {POPULAR_CITIES.map((city) => {
          const isActive = 
            currentCityName.toLowerCase() === city.name.toLowerCase() || 
            currentCityName.toLowerCase() === city.query.toLowerCase();

          return (
            <button
              key={city.query}
              onClick={() => onSelectCity(city.query)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all duration-250 border transform hover:scale-[1.03] ${
                isActive
                  ? `bg-white border-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.15)]`
                  : `bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white`
              }`}
            >
              <span>{city.flag}</span>
              <span>{city.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
