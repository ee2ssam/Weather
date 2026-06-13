import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to generate realistic deterministic weather data
function generateMockWeather(q: { lat?: number; lon?: number; city?: string }) {
  let cityName = q.city || "서울";
  let lat = q.lat || 37.5665;
  let lon = q.lon || 126.9780;
  
  if (q.city) {
    const cityLower = q.city.trim().toLowerCase();
    if (cityLower === "seoul" || cityLower === "서울") {
      cityName = "서울"; lat = 37.5665; lon = 126.9780;
    } else if (cityLower === "busan" || cityLower === "부산") {
      cityName = "부산"; lat = 35.1796; lon = 129.0756;
    } else if (cityLower === "incheon" || cityLower === "인천") {
      cityName = "인천"; lat = 37.4563; lon = 126.7052;
    } else if (cityLower === "daegu" || cityLower === "대구") {
      cityName = "대구"; lat = 35.8714; lon = 128.6014;
    } else if (cityLower === "daejeon" || cityLower === "대전") {
      cityName = "대전"; lat = 36.3504; lon = 127.3845;
    } else if (cityLower === "gwangju" || cityLower === "광주") {
      cityName = "광주"; lat = 35.1595; lon = 126.8526;
    } else if (cityLower === "ulsan" || cityLower === "울산") {
      cityName = "울산"; lat = 35.5384; lon = 129.3114;
    } else if (cityLower === "jeju" || cityLower === "제주" || cityLower === "제주도") {
      cityName = "제주"; lat = 33.4996; lon = 126.5312;
    } else if (cityLower === "tokyo" || cityLower === "도쿄") {
      cityName = "도쿄"; lat = 35.6762; lon = 139.6503;
    } else if (cityLower === "london" || cityLower === "런던") {
      cityName = "런던"; lat = 51.5074; lon = -0.1278;
    } else if (cityLower === "new york" || cityLower === "뉴욕") {
      cityName = "뉴욕"; lat = 40.7128; lon = -74.0060;
    } else if (cityLower === "paris" || cityLower === "파리") {
      cityName = "파리"; lat = 48.8566; lon = 2.3522;
    } else {
      cityName = q.city.trim();
      let hash = 0;
      for (let i = 0; i < cityName.length; i++) {
        hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
      }
      lat = 30 + (Math.abs(hash % 20));
      lon = 100 + (Math.abs((hash >> 3) % 40));
    }
  } else if (q.lat !== undefined && q.lon !== undefined) {
    const latNum = Number(q.lat);
    const lonNum = Number(q.lon);
    if (Math.abs(latNum - 37.56) < 0.2 && Math.abs(lonNum - 126.97) < 0.2) {
      cityName = "서울";
    } else if (Math.abs(latNum - 35.18) < 0.2 && Math.abs(lonNum - 129.07) < 0.2) {
      cityName = "부산";
    } else if (Math.abs(latNum - 33.5) < 0.3 && Math.abs(lonNum - 126.52) < 0.3) {
      cityName = "제주";
    } else {
      cityName = `내 위치 (위도 ${latNum.toFixed(2)}, 경도 ${lonNum.toFixed(2)})`;
    }
    lat = latNum;
    lon = lonNum;
  }

  const now = new Date();
  const seed = lat + lon + now.getHours();
  const rand = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const r = x - Math.floor(x);
    return min + r * (max - min);
  };

  const temp = Math.round(rand(12, 28));
  const feels_like = Math.round(temp + rand(-2, 2, 1));
  const humidity = Math.round(rand(40, 85, 2));
  const pressure = Math.round(rand(1005, 1020, 3));
  const windSpeed = parseFloat(rand(1, 8, 4).toFixed(1));

  let weatherId = 800; // Clear
  let weatherMain = "Clear";
  let weatherDesc = "맑음";
  let icon = "01d";

  const weatherSeed = Math.abs(Math.floor(rand(1, 10, 5))) % 4;
  if (weatherSeed === 0) {
    weatherId = 800; weatherMain = "Clear"; weatherDesc = "맑음"; icon = "01d";
  } else if (weatherSeed === 1) {
    weatherId = 803; weatherMain = "Clouds"; weatherDesc = "구름 많음"; icon = "03d";
  } else if (weatherSeed === 2) {
    weatherId = 500; weatherMain = "Rain"; weatherDesc = "비"; icon = "10d";
  } else {
    weatherId = 801; weatherMain = "Clouds"; weatherDesc = "구름 조금"; icon = "02d";
  }

  const isNight = now.getHours() < 6 || now.getHours() > 19;
  if (isNight) {
    icon = icon.replace("d", "n");
  }

  const current = {
    coord: { lat, lon },
    weather: [{ id: weatherId, main: weatherMain, description: weatherDesc, icon }],
    main: {
      temp,
      feels_like,
      temp_min: temp - 3,
      temp_max: temp + 3,
      pressure,
      humidity
    },
    wind: { speed: windSpeed, deg: Math.round(rand(0, 360, 6)) },
    sys: { country: "KR", sunrise: Math.floor(Date.now() / 1000) - 20000, sunset: Math.floor(Date.now() / 1000) + 20000 },
    name: cityName,
    dt: Math.floor(Date.now() / 1000)
  };

  const forecastList = [];
  for (let i = 1; i <= 5; i++) {
    const fDate = new Date(now);
    fDate.setDate(now.getDate() + i);
    fDate.setHours(12, 0, 0, 0);

    const fSeed = lat + lon + i;
    const fRand = (min: number, max: number, offset = 0) => {
      const x = Math.sin(fSeed + offset) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };

    const fTemp = Math.round(temp + fRand(-5, 5));
    const fHumidity = Math.round(humidity + fRand(-15, 15, 1));
    
    let fWeatherId = 800;
    let fWeatherMain = "Clear";
    let fWeatherDesc = "맑음";
    let fIcon = "01d";

    const fWeatherSeed = Math.abs(Math.floor(fRand(1, 10, 2))) % 4;
    if (fWeatherSeed === 0) {
      fWeatherId = 800; fWeatherMain = "Clear"; fWeatherDesc = "맑음"; fIcon = "01d";
    } else if (fWeatherSeed === 1) {
      fWeatherId = 803; fWeatherMain = "Clouds"; fWeatherDesc = "구름 많음"; fIcon = "03d";
    } else if (fWeatherSeed === 2) {
      fWeatherId = 500; fWeatherMain = "Rain"; fWeatherDesc = "비"; fIcon = "10d";
    } else {
      fWeatherId = 801; fWeatherMain = "Clouds"; fWeatherDesc = "구름 조금"; fIcon = "02d";
    }

    forecastList.push({
      dt: Math.floor(fDate.getTime() / 1000),
      main: {
        temp: fTemp,
        feels_like: Math.round(fTemp + fRand(-1, 1, 3)),
        temp_min: fTemp - 2,
        temp_max: fTemp + 2,
        pressure: pressure + Math.round(fRand(-5, 5, 4)),
        humidity: Math.min(100, Math.max(0, fHumidity))
      },
      weather: [{ id: fWeatherId, main: fWeatherMain, description: fWeatherDesc, icon: fIcon }],
      wind: { speed: parseFloat((windSpeed + fRand(-2, 2, 5)).toFixed(1)) },
      dt_txt: fDate.toISOString().replace("T", " ").substring(0, 19)
    });
  }

  const hourlyList = [];
  for (let i = 1; i <= 6; i++) {
    const hDate = new Date(now);
    hDate.setHours(now.getHours() + i * 3);

    const hSeed = lat + lon + i + 10;
    const hRand = (min: number, max: number, offset = 0) => {
      const x = Math.sin(hSeed + offset) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };

    const hTemp = Math.round(temp + hRand(-3, 3));
    
    let hWeatherId = weatherId;
    let hWeatherMain = weatherMain;
    let hWeatherDesc = weatherDesc;
    let hIcon = icon;

    const isHNight = hDate.getHours() < 6 || hDate.getHours() > 19;
    hIcon = isHNight ? hIcon.replace("d", "n") : hIcon.replace("n", "d");

    // Simplify the weather description for hourly indicators
    const hWeatherDescSeed = Math.abs(Math.floor(hRand(1, 10, 7))) % 4;
    let hDesc = "맑음";
    if (hWeatherDescSeed === 1) {
      hDesc = "구름 많음";
      hIcon = isHNight ? "03n" : "03d";
    } else if (hWeatherDescSeed === 2) {
      hDesc = "비";
      hIcon = isHNight ? "10n" : "10d";
    } else if (hWeatherDescSeed === 3) {
      hDesc = "구름 조금";
      hIcon = isHNight ? "02n" : "02d";
    } else {
      hIcon = isHNight ? "01n" : "01d";
    }

    hourlyList.push({
      dt: Math.floor(hDate.getTime() / 1000),
      main: { temp: hTemp },
      weather: [{ id: hWeatherId, main: hWeatherMain, description: hDesc, icon: hIcon }],
      dt_txt: hDate.toLocaleTimeString("ko-KR", { hour: "numeric", hour12: true })
    });
  }

  return {
    current,
    forecast: { list: forecastList },
    hourly: hourlyList,
    isDemo: true
  };
}

// REST proxy endpoint for weather
app.get("/api/weather", async (req, res) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const isKeyInvalid = !apiKey || apiKey === "MY_OPENWEATHER_API_KEY" || apiKey.trim() === "";

  const { lat, lon, city } = req.query;

  // Use demo data if API key is not configured
  if (isKeyInvalid) {
    const demoData = generateMockWeather({
      lat: lat ? Number(lat) : undefined,
      lon: lon ? Number(lon) : undefined,
      city: city ? String(city) : undefined
    });
    return res.json(demoData);
  }

  try {
    let queryParamsWeather = `appid=${apiKey}&units=metric&lang=kr`;
    let queryParamsForecast = `appid=${apiKey}&units=metric&lang=kr`;

    if (city) {
      const escapedCity = encodeURIComponent(String(city));
      queryParamsWeather += `&q=${escapedCity}`;
      queryParamsForecast += `&q=${escapedCity}`;
    } else if (lat && lon) {
      queryParamsWeather += `&lat=${lat}&lon=${lon}`;
      queryParamsForecast += `&lat=${lat}&lon=${lon}`;
    } else {
      // Default fallback (Seoul)
      queryParamsWeather += `&lat=37.5665&lon=126.9780`;
      queryParamsForecast += `&lat=37.5665&lon=126.9780`;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?${queryParamsWeather}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${queryParamsForecast}`;

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    if (!weatherRes.ok) {
      const errText = await weatherRes.text();
      try {
        const errJson = JSON.parse(errText);
        // Translate common OpenWeather error codes to clear Korean descriptions for the UI
        if (errJson.cod === "404" || errJson.message?.includes("not found")) {
          return res.status(404).json({ error: "해당 도시를 찾을 수 없습니다. 영문이나 한글 도시 이름을 다시 확인해 주세요." });
        }
        return res.status(weatherRes.status).json({ error: errJson.message || "날씨 데이터를 불러오는데 실패했습니다." });
      } catch (e) {
        return res.status(weatherRes.status).json({ error: "날씨 정보를 불러오는 중 에러가 발생했습니다." });
      }
    }

    const currentData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    // Map the forecast 3-hour list to a 5-day daily forecast (around noon) and hourly forecast (first 6 periods)
    const list = forecastData.list || [];
    
    // Group forecast by day and pick mid-day interval
    const dailyForecasts: any[] = [];
    const seenDays = new Set<string>();
    
    for (const item of list) {
      const dateStr = item.dt_txt?.split(" ")[0] || ""; // e.g. "2026-06-13"
      if (!dateStr) continue;
      
      const isToday = dateStr === new Date().toISOString().split("T")[0];
      if (isToday) continue; // Skip today, focus on next days

      if (!seenDays.has(dateStr)) {
        // Find best match near 12:00 or just take the first record of the next days
        const isNearNoon = item.dt_txt?.includes("12:00") || item.dt_txt?.includes("09:00") || item.dt_txt?.includes("15:00") || true;
        if (isNearNoon) {
          seenDays.add(dateStr);
          dailyForecasts.push(item);
        }
      }
      if (dailyForecasts.length >= 5) break;
    }

    // Generate hourly from immediate forecast list
    const hourlyFromList = list.slice(0, 6).map((item: any) => {
      const date = new Date(item.dt * 1000);
      return {
        dt: item.dt,
        main: { temp: Math.round(item.main.temp) },
        weather: item.weather,
        dt_txt: date.toLocaleTimeString("ko-KR", { hour: "numeric", hour12: true })
      };
    });

    return res.json({
      current: currentData,
      forecast: { list: dailyForecasts },
      hourly: hourlyFromList,
      isDemo: false
    });

  } catch (error: any) {
    console.error("Weather proxy API error:", error);
    res.status(500).json({ error: "날씨 정보를 가저오는 중 서버 오류가 발생했습니다." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
