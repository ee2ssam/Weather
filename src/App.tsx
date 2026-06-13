import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Navigation, 
  RefreshCw, 
  Info, 
  MapPin, 
  AlertTriangle, 
  CloudSun,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";

import { WeatherResponse, WeatherData } from "./types";
import { getWeatherTheme, formatTemp, formatDate, formatTime } from "./utils";

import CityQuickSelector from "./components/CityQuickSelector";
import WeatherStats from "./components/WeatherStats";
import HourlyForecast from "./components/HourlyForecast";
import WeeklyForecast from "./components/WeeklyForecast";

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastQuery, setLastQuery] = useState<{ lat?: number; lon?: number; city?: string }>({ city: "Seoul" });
  const [geoErrorNotice, setGeoErrorNotice] = useState<string | null>(null);

  // Fetch weather dataset from our custom Express backend API
  const fetchWeather = async (params: { lat?: number; lon?: number; city?: string }) => {
    setLoading(true);
    setError(null);
    setGeoErrorNotice(null);

    try {
      let url = "/api/weather";
      const queryParts: string[] = [];

      if (params.city) {
        queryParts.push(`city=${encodeURIComponent(params.city)}`);
      } else if (params.lat !== undefined && params.lon !== undefined) {
        queryParts.push(`lat=${params.lat}`);
        queryParts.push(`lon=${params.lon}`);
      }

      if (queryParts.length > 0) {
        url += `?${queryParts.join("&")}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "날씨 정보를 가저오는 중 요류가 발생했습니다.");
      }

      setWeatherData(data);
      setLastQuery(params);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "날씨 데이터 취득 실패");
    } finally {
      setLoading(false);
    }
  };

  // Get browser Geolocation coords
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoErrorNotice("이 브라우저는 현재 위치 파악 기능을 지원하지 않습니다.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather({ lat, lon });
      },
      (error) => {
        console.warn("Geolocation warning:", error);
        let msg = "위치 권한 획득 실패. ";
        if (error.code === error.PERMISSION_DENIED) {
          msg += "브라우저 및 위치 접근 권한을 허용해 주시거나, 상단 '새 탭에서 열기'를 통해 전용 주소에서 권한을 확인해주세요.";
        } else {
          msg += "일시적인 원인으로 위치를 읽을 수 없습니다. 대신 기본 위치(서울) 정보를 보여줍니다.";
        }
        setGeoErrorNotice(msg);
        
        // Default fallback if geolocation fails
        if (!weatherData) {
          fetchWeather({ city: "Seoul" });
        } else {
          setLoading(false);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // On mount, fetch current location or fallback immediately
  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchWeather({ city: searchQuery.trim() });
    setSearchQuery("");
  };

  const handleRefresh = () => {
    fetchWeather(lastQuery);
  };

  // Default theme if no data is loaded yet
  const defaultTheme = getWeatherTheme("01d");
  const theme = weatherData ? getWeatherTheme(weatherData.current.weather[0].icon) : defaultTheme;

  const current = weatherData?.current;
  const isDemo = weatherData?.isDemo ?? false;

  return (
    <div className={`min-h-screen bg-slate-950 transition-all duration-700 font-sans text-white flex flex-col relative overflow-x-hidden`}>
      {/* Immersive Brand Radial Glow Aura Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b82f6_0%,transparent_60%),radial-gradient(circle_at_10%_80%,#1e3a8a_0%,transparent_50%)] opacity-40 pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto px-6 py-8 md:py-12 flex-grow relative z-10 flex flex-col gap-6">
        
        {/* Header App Brand Area */}
        <header className="flex flex-col md:flex-row items-center md:justify-between gap-5 border-b border-white/5 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <div className="w-5 h-5 rounded-full bg-yellow-400 blur-[1px] animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-light tracking-widest uppercase block text-white">Atmosphere</span>
              <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">SkyBrief 기상국</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5">
            {/* C/F Unit Toggle Button */}
            <button
              onClick={() => setIsCelsius(!isCelsius)}
              className="text-xs font-semibold hover:text-blue-400 cursor-pointer transition-colors"
            >
              단위: {isCelsius ? "°C" : "°F"}
            </button>
            <div className="w-px h-4 bg-white/20" />

            {/* Geolocation Update Trigger */}
            <button
              onClick={handleGetCurrentLocation}
              title="현재 위치 기반 날씨로 업데이트"
              className="text-xs font-semibold hover:text-blue-400 flex items-center gap-1.5 cursor-pointer"
            >
              <span>내 위치 날씨</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </button>
            <div className="w-px h-4 bg-white/20" />

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="날씨 데이터 새로고침"
              className="hover:text-blue-400 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Demo Mode Notice Banner - Beautiful and non-obtrusive */}
        {isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/30 dark:border-amber-400/30 text-amber-900 dark:text-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs justify-between shadow-xs backdrop-blur-md"
          >
            <div className="flex items-start sm:items-center gap-2">
              <Info className="w-4 h-4 mt-0.5 sm:mt-0 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>데모 모드 가동 중:</strong> OpenWeather API Key가 없거나 유효하지 않아 아름답게 정밀 구현된 <strong>모의 날씨 데이터</strong>로 작동하고 있습니다. <code>.env</code> 파일에 실제 키를 추가하시면 실시간 실측 정보로 자동 연동됩니다.
              </span>
            </div>
            <a 
              href="https://openweathermap.org/api" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 font-semibold underline text-amber-800 dark:text-amber-300 shrink-0 hover:opacity-80 mx-6 sm:mx-0"
            >
              <span>키 발급받기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}

        {/* Geolocation Permissions Warning Banner if any */}
        {geoErrorNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-blue-500/10 border border-blue-500/20 text-slate-900 dark:text-blue-100 p-3.5 rounded-2xl flex items-start gap-2 text-xs backdrop-blur-md"
          >
            <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-grow">
              <p>{geoErrorNotice}</p>
              <button 
                onClick={() => window.open(window.location.href, "_blank")}
                className="mt-1.5 inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 underline hover:opacity-80"
              >
                <span>새 탭에서 열어 위치 권한 허용하기</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Query Input Field Search */}
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="도시 이름을 입력하세요 (예: 서울, 제주, New York, London)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-sm font-medium shadow-sm transition-all duration-300 text-white placeholder-white/40"
            />
            <Search className="absolute left-4 w-4 h-4 text-white/40 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-white/90 text-xs font-semibold cursor-pointer transition-all duration-200 shadow-xs"
            >
              날씨 검색
            </button>
          </div>
        </form>

        {/* Navigation Quick Selection Tabs */}
        {current && (
          <CityQuickSelector 
            currentCityName={current.name}
            onSelectCity={(cityQuery) => fetchWeather({ city: cityQuery })}
            accentClass={theme.accentColor}
          />
        )}

        {/* Main Loading Block Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full py-24 flex flex-col items-center justify-center gap-3"
            >
              <Loader2 className="w-8 h-8 text-slate-800 dark:text-white animate-spin opacity-80" />
              <p className="text-sm font-medium tracking-tight opacity-70">실시간 대기 기상 관측 동기화 중...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`w-full p-6 text-center rounded-3xl border backdrop-blur-md ${theme.cardBg} flex flex-col items-center gap-3 shadow-md`}
            >
              <div className="p-3 rounded-full bg-red-400/20 text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">날씨 정보를 조회하지 못했습니다</h3>
                <p className="text-xs opacity-75">{error}</p>
              </div>
              <button
                onClick={() => fetchWeather({ city: "Seoul" })}
                className="mt-2 px-4 py-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200"
              >
                서울 날씨 기본값으로 로드
              </button>
            </motion.div>
          ) : current && weatherData ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              {/* PRIMARY BENTO GRID COMPONENT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Visual Giant Hero Card */}
                <div className={`md:col-span-2 rounded-3xl border backdrop-blur-md ${theme.cardBg} p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group`}>
                  
                  {/* Subtle graphical background elements */}
                  <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-500 text-current">
                    <CloudSun className="w-full h-full" />
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      {/* Name of City / Country */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <h2 className="text-xl font-light tracking-widest uppercase text-white/90">
                          {current.name}
                        </h2>
                        <span className="text-[9px] font-mono tracking-widest bg-white/10 px-1.5 py-0.5 rounded-sm font-semibold uppercase">
                          {current.sys.country}
                        </span>
                      </div>
                      <p className={`text-xs tracking-wider opacity-60`}>{formatDate(current.dt)}</p>
                    </div>

                    {/* Simple badge indicating mode (Real/Simulation) */}
                    <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full border ${
                      isDemo 
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300" 
                        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    }`}>
                      {isDemo ? "Simulated" : "Live Realtime"}
                    </span>
                  </div>

                  {/* Temperature Display Column (Immersive UI thin typeface) */}
                  <div className="my-8">
                    <h2 className="text-7xl md:text-8xl font-thin tracking-tighter text-white">
                      {Math.round(current.main.temp)}<span className={theme.accentColor}>°</span>
                    </h2>
                    <p className="text-xl md:text-2xl font-light text-white/80 mt-2">
                      {current.weather[0].description}
                    </p>
                    <p className="text-xs text-white/40 mt-1.5 uppercase tracking-[0.2em]">
                      MAX: {formatTemp(current.main.temp_max, isCelsius)} / MIN: {formatTemp(current.main.temp_min, isCelsius)}
                    </p>
                  </div>

                  {/* Mini visual summary card wrapper */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5 text-xs">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="text-white/60 leading-relaxed">
                      오늘의 체감 기온은 {formatTemp(current.main.feels_like, isCelsius)}입니다. 대기 지표에 따르면 활기차고 평화로운 실외 활동을 추천합니다.
                    </p>
                  </div>
                </div>

                {/* Vertical brief widget for timezone / clock summary */}
                <div className={`rounded-3xl border backdrop-blur-md ${theme.cardBg} p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-1">대기 정보 관측국</span>
                    <h4 className="text-sm font-medium mt-1 text-white">Station: IC-5520-2</h4>
                    <p className="text-xs text-white/50 mt-2 leading-relaxed">
                      세계기상기구(WMO)와 기상국 위성의 실시간 레이더 자료를 기준으로 동기화된 대기압 지수 및 미기후 지수를 리포트합니다.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs pb-1.5">
                      <span className="text-white/40 uppercase tracking-wider">업데이트 시각</span>
                      <span className="font-semibold">{formatTime(current.dt)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-1.5">
                      <span className="text-white/40 uppercase tracking-wider">대기압 지수</span>
                      <span className="font-semibold">{current.main.pressure} hPa</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40 uppercase tracking-wider">관측 풍향</span>
                      <span className="font-semibold">{current.wind.deg}°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECONDARY HOURLY TIMELINE SCROLL */}
              <HourlyForecast 
                hourlyList={weatherData.hourly} 
                theme={theme} 
                isCelsius={isCelsius} 
              />

              {/* TERTIARY GRID CARD: SPECIFIC GRID STATS + WEEKLY FORECASTS */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                
                {/* Specific Grid Metrics */}
                <div className="lg:col-span-3 w-full">
                  <h3 className="text-sm font-medium mb-3 opacity-80 pl-1">상세 기상 수치 목록</h3>
                  <WeatherStats 
                    weather={current} 
                    theme={theme} 
                    isCelsius={isCelsius} 
                  />
                </div>

                {/* 5 Days Forecasting Panel */}
                <div className="lg:col-span-2 w-full">
                  <WeeklyForecast 
                    forecastList={weatherData.forecast.list} 
                    theme={theme} 
                    isCelsius={isCelsius} 
                  />
                </div>

              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Elegant Footer branding */}
        <footer className="mt-auto pt-10 text-center flex flex-col items-center gap-1.5 opacity-60 text-[11px]">
          <p>© 2026 SkyBrief Applet. Crafted for Google AI Studio Web Environment.</p>
          <div className="flex items-center gap-2">
            <span>Powered by OpenWeather Radar API</span>
            <span>•</span>
            <span className="font-mono">Geolocation Sync Active</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
