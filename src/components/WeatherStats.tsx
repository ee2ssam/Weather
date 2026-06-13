import { motion } from "motion/react";
import { 
  Wind, 
  Droplets, 
  Gauge, 
  Sunrise, 
  Sunset, 
  Thermometer 
} from "lucide-react";
import { WeatherData } from "../types";
import { formatTemp, formatTime, WeatherTheme } from "../utils";

interface WeatherStatsProps {
  weather: WeatherData;
  theme: WeatherTheme;
  isCelsius: boolean;
}

export default function WeatherStats({ weather, theme, isCelsius }: WeatherStatsProps) {
  const stats = [
    {
      id: "feels_like",
      title: "체감 온도",
      value: formatTemp(weather.main.feels_like, isCelsius),
      desc: `실제 기온과 ${Math.round(Math.abs(weather.main.temp - weather.main.feels_like))}° 차이`,
      icon: Thermometer,
      color: "text-red-400"
    },
    {
      id: "humidity",
      title: "습도",
      value: `${weather.main.humidity}%`,
      desc: weather.main.humidity > 60 ? "다소 습한 날씨" : weather.main.humidity < 40 ? "건조한 날씨" : "쾌적한 습도",
      icon: Droplets,
      color: "text-blue-400"
    },
    {
      id: "wind",
      title: "바람",
      value: `${weather.wind.speed} m/s`,
      desc: `풍향: ${weather.wind.deg}°`,
      icon: Wind,
      color: "text-teal-400"
    },
    {
      id: "pressure",
      title: "기압",
      value: `${weather.main.pressure} hPa`,
      desc: "대기 압력 수치",
      icon: Gauge,
      color: "text-emerald-400"
    },
    {
      id: "sunrise",
      title: "일출 시간",
      value: formatTime(weather.sys.sunrise),
      desc: "아침 태양이 뜨는 시각",
      icon: Sunrise,
      color: "text-amber-400"
    },
    {
      id: "sunset",
      title: "일몰 시간",
      value: formatTime(weather.sys.sunset),
      desc: "저녁 태양이 지는 시각",
      icon: Sunset,
      color: "text-indigo-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            variants={itemVariants}
            className={`p-4 rounded-2xl flex flex-col justify-between ${theme.cardBg} transition-all duration-300 relative overflow-hidden backdrop-blur-md border hover:scale-[1.02] hover:shadow-md`}
          >
            {/* Background Accent glow */}
            <div className="absolute right-[-10px] top-[-10px] w-20 h-20 rounded-full opacity-[0.03] bg-current" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">{stat.title}</span>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>

            <div>
              <span className="text-xl font-semibold tracking-tight">{stat.value}</span>
              <p className={`text-[10px] mt-1 ${theme.textMuted} truncate`}>{stat.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
