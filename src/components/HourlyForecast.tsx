import { motion } from "motion/react";
import { HourlyItem } from "../types";
import { getWeatherIcon, formatTemp, WeatherTheme } from "../utils";

interface HourlyForecastProps {
  hourlyList: HourlyItem[];
  theme: WeatherTheme;
  isCelsius: boolean;
}

export default function HourlyForecast({ hourlyList, theme, isCelsius }: HourlyForecastProps) {
  if (!hourlyList || hourlyList.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium mb-3 pl-1">시간대별 날씨 (3시간 간격)</h3>
      
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {hourlyList.map((hour, idx) => {
          const weather = hour.weather?.[0] || { icon: "01d", description: "맑음" };
          return (
            <motion.div
              key={hour.dt + idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`flex flex-col items-center justify-between p-3.5 rounded-2xl min-w-[85px] text-center border backdrop-blur-md ${theme.cardBg} transition-all duration-300 hover:scale-105 hover:shadow-xs`}
            >
              {/* Header: Hour string (e.g. "오후 3시") */}
              <span className={`text-[11px] font-medium ${theme.textMuted} whitespace-nowrap`}>
                {idx === 0 ? "지금" : hour.dt_txt || ""}
              </span>

              {/* Icon */}
              <div className="my-3 flex items-center justify-center">
                {getWeatherIcon(weather.icon, "w-7 h-7")}
              </div>

              {/* Temperature & brief note */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-semibold">{formatTemp(hour.main.temp, isCelsius)}</span>
                <span className={`text-[9px] font-medium opacity-70`}>{weather.description}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
