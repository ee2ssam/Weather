export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherData {
  coord: {
    lat: number;
    lon: number;
  };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  name: string;
  dt: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  wind: {
    speed: number;
  };
  dt_txt: string;
}

export interface HourlyItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: WeatherCondition[];
  dt_txt: string;
}

export interface WeatherResponse {
  current: WeatherData;
  forecast: {
    list: ForecastItem[];
  };
  hourly: HourlyItem[];
  isDemo: boolean;
  error?: string;
}
