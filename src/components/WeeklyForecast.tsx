import { motion } from "motion/react";
import { ForecastItem } from "../types";
import { getWeatherIcon, formatTemp, formatDate, WeatherTheme } from "../utils";

interface WeeklyForecastProps {
  forecastList: ForecastItem[];
  theme: WeatherTheme;
  isCelsius: boolean;
}

export default function WeeklyForecast({ forecastList, theme, isCelsius }: WeeklyForecastProps) {
  if (!forecastList || forecastList.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium mb-3 pl-1">5일간의 예보</h3>

      <div className={`rounded-3xl border backdrop-blur-md ${theme.cardBg} p-5 flex flex-col gap-4 shadow-xs`}>
        {forecastList.map((day, idx) => {
          const weather = day.weather?.[0] || { icon: "01d", description: "맑음" };
          
          return (
            <motion.div
              key={day.dt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between pb-3 last:pb-0 border-b last:border-b-0 border-white/5"
            >
              {/* Day info */}
              <div className="flex flex-col w-[110px]">
                <span className="text-xs font-semibold whitespace-nowrap text-white">
                  {formatDate(day.dt)}
                </span>
                <span className="text-[10px] text-white/40 tracking-wider">
                  {idx === 0 ? "내일 날씨" : `예보 D+${idx + 1}`}
                </span>
              </div>

              {/* Weather icon & Description */}
              <div className="flex items-center gap-2 flex-grow justify-start">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getWeatherIcon(weather.icon, "w-6 h-6")}
                </div>
                <span className="text-xs text-white/80 font-medium truncate max-w-[124px]">
                  {weather.description}
                </span>
              </div>

              {/* Min/Max Temperature */}
              <div className="flex items-center justify-end gap-3 text-right">
                <span className="text-xs font-semibold text-blue-400">
                  {formatTemp(day.main.temp_min, isCelsius)}
                </span>
                
                {/* Visual thermometer bar */}
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden hidden sm:block relative">
                  <div 
                    className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-amber-400"
                    style={{ left: "20%", right: "20%" }}
                  />
                </div>

                <span className="text-xs font-semibold text-amber-400">
                  {formatTemp(day.main.temp_max, isCelsius)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
