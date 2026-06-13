import React from "react";
import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudSun, 
  CloudMoon, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Snowflake, 
  CloudFog,
  Wind,
  Droplets,
  Timer,
  Sunrise,
  Sunset
} from "lucide-react";

// Get appropriate weather icon based on OpenWeather icon code
export function getWeatherIcon(iconCode: string, className = "w-6 h-6") {
  const code = iconCode ? iconCode.substring(0, 2) : "01";
  const isNight = iconCode ? iconCode.endsWith("n") : false;

  switch (code) {
    case "01": // Clear sky
      return isNight 
        ? React.createElement(Moon, { className }) 
        : React.createElement(Sun, { className: `${className} text-amber-500 animate-pulse` });
    case "02": // Few clouds
      return isNight 
        ? React.createElement(CloudMoon, { className }) 
        : React.createElement(CloudSun, { className: `${className} text-amber-400` });
    case "03": // Scattered clouds
    case "04": // Broken clouds
      return React.createElement(Cloud, { className: `${className} text-slate-400` });
    case "09": // Shower rain
      return React.createElement(CloudDrizzle, { className: `${className} text-sky-400` });
    case "10": // Rain
      return React.createElement(CloudRain, { className: `${className} text-blue-400` });
    case "11": // Thunderstorm
      return React.createElement(CloudLightning, { className: `${className} text-purple-400` });
    case "13": // Snow
      return React.createElement(Snowflake, { className: `${className} text-cyan-200` });
    case "50": // Mist / Fog
      return React.createElement(CloudFog, { className: `${className} text-teal-300` });
    default:
      return React.createElement(Cloud, { className });
  }
}

export interface WeatherTheme {
  primaryBg: string;
  cardBg: string;
  accentColor: string;
  textMuted: string;
  iconBg: string;
}

// Generate premium glassmorphic dark color themes based on the weather condition for the Immersive UI flavor
export function getWeatherTheme(iconCode: string): WeatherTheme {
  const code = iconCode ? iconCode.substring(0, 2) : "01";
  const isNight = iconCode ? iconCode.endsWith("n") : false;

  if (isNight) {
    return {
      primaryBg: "from-slate-950 via-slate-900 to-indigo-950",
      cardBg: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
      accentColor: "text-indigo-400",
      textMuted: "text-white/40",
      iconBg: "bg-white/10 text-indigo-300"
    };
  }

  switch (code) {
    case "01": // Clear Sky
      return {
        primaryBg: "from-slate-950 via-blue-950/40 to-slate-950",
        cardBg: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
        accentColor: "text-yellow-400",
        textMuted: "text-white/40",
        iconBg: "bg-white/10 text-yellow-300"
      };
    case "02": // Few Clouds
    case "03": // Scattered Clouds
    case "04": // Broken Clouds
      return {
        primaryBg: "from-slate-950 via-indigo-950/30 to-slate-950",
        cardBg: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
        accentColor: "text-sky-300",
        textMuted: "text-white/40",
        iconBg: "bg-white/10 text-sky-200"
      };
    case "09": // Drizzle
    case "10": // Rain
      return {
        primaryBg: "from-slate-950 via-cyan-950/40 to-slate-950",
        cardBg: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
        accentColor: "text-blue-400",
        textMuted: "text-white/40",
        iconBg: "bg-white/15 text-blue-300"
      };
    case "11": // Thunderstorm
      return {
        primaryBg: "from-slate-950 via-purple-950/45 to-slate-950",
        cardBg: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
        accentColor: "text-purple-400",
        textMuted: "text-white/40",
        iconBg: "bg-white/10 text-purple-300"
      };
    case "13": // Snow
      return {
        primaryBg: "from-slate-950 via-sky-950/35 to-slate-950",
        cardBg: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
        accentColor: "text-cyan-300",
        textMuted: "text-white/40",
        iconBg: "bg-white/10 text-cyan-200"
      };
    case "50": // Mist / Fog
      return {
        primaryBg: "from-slate-950 via-teal-950/30 to-slate-950",
        cardBg: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
        accentColor: "text-teal-400",
        textMuted: "text-white/40",
        iconBg: "bg-white/10 text-teal-300"
      };
    default:
      return {
        primaryBg: "from-slate-950 via-blue-950/30 to-slate-950",
        cardBg: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
        accentColor: "text-blue-400",
        textMuted: "text-white/40",
        iconBg: "bg-white/10 text-white"
      };
  }
}

// Convert Celsius to Fahrenheit
export function formatTemp(celsius: number, isCelsius: boolean): string {
  const rounded = Math.round(celsius);
  if (isCelsius) return `${rounded}°C`;
  const fahrenheit = Math.round((celsius * 9) / 5 + 32);
  return `${fahrenheit}°F`;
}

// Format unix timestamp to localized time e.g., "14:35" or "오후 2:35"
export function formatTime(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit", hour12: true });
}

// Format unix timestamp to stylized date e.g., "6월 13일 (토)"
export function formatDate(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = date.toLocaleDateString("ko-KR", { weekday: "short" });
  return `${month}월 ${day}일 (${dayName})`;
}
