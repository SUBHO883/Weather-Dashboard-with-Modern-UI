const API_KEY = "696d7b2a78de46e902be296561d8a9ea"; // apna OpenWeatherMap API key daalo
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentWeather = document.getElementById("currentWeather");
const forecastData = document.getElementById("forecastData");
const errorMsg = document.getElementById("errorMsg");
const themeToggle = document.getElementById("themeToggle");

const icons = {
  "01d":"fas fa-sun","01n":"fas fa-moon",
  "02d":"fas fa-cloud-sun","02n":"fas fa-cloud-moon",
  "03d":"fas fa-cloud","03n":"fas fa-cloud",
  "04d":"fas fa-cloud","04n":"fas fa-cloud",
  "09d":"fas fa-cloud-showers-heavy","09n":"fas fa-cloud-showers-heavy",
  "10d":"fas fa-cloud-sun-rain","10n":"fas fa-cloud-moon-rain",
  "11d":"fas fa-bolt","11n":"fas fa-bolt",
  "13d":"fas fa-snowflake","13n":"fas fa-snowflake",
  "50d":"fas fa-smog","50n":"fas fa-smog"
};

themeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("light");
  themeToggle.innerHTML=document.body.classList.contains("light")
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});

async function fetchWeather(city){
  try{
    currentWeather.innerHTML='<div class="loading"><div class="spinner"></div></div>';
    forecastData.innerHTML='<div class="loading"><div class="spinner"></div></div>';
    errorMsg.style.display="none";

    const currentRes=await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if(!currentRes.ok) throw new Error("City not found");
    const current=await currentRes.json();

    const forecastRes=await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    if(!forecastRes.ok) throw new Error("Forecast unavailable");
    const forecast=await forecastRes.json();

    renderCurrent(current);
    renderForecast(forecast);
  }catch(err){
    errorMsg.style.display="block";
    errorMsg.textContent=err.message;
    currentWeather.innerHTML="";
    forecastData.innerHTML="";
  }
}

function renderCurrent(data){
  const {name,main,weather,wind,sys}=data;
  const icon=icons[weather[0].icon]||"fas fa-cloud";
  currentWeather.innerHTML=`
    <div class="weather-header"><i class="${icon}"></i><div class="temp">${Math.round(main.temp)}°C</div></div>
    <div class="city">${name}, ${sys.country}</div>
    <div class="desc">${weather[0].description}</div>
    <div class="details">
      <div><i class="fas fa-temperature-high"></i><div>Feels: ${Math.round(main.feels_like)}°C</div></div>
      <div><i class="fas fa-tint"></i><div>Humidity: ${main.humidity}%</div></div>
      <div><i class="fas fa-wind"></i><div>Wind: ${wind.speed} m/s</div></div>
      <div><i class="fas fa-compress-alt"></i><div>Pressure: ${main.pressure} hPa</div></div>
    </div>
  `;
}

function renderForecast(data){
  if(!data.list){forecastData.innerHTML="<p>No forecast available</p>";return;}
  const grouped={};
  data.list.forEach(item=>{
    const date=new Date(item.dt*1000);
    const day=date.toDateString();
    if(!grouped[day]) grouped[day]=[];
    grouped[day].push(item);
  });

  const today=new Date().toDateString();
  const days=Object.keys(grouped).filter(d=>d!==today).slice(0,5);

  forecastData.innerHTML=days.map(day=>{
    const arr=grouped[day];
    const temps=arr.map(x=>x.main.temp);
    const min=Math.min(...temps);
    const max=Math.max(...temps);
    const icon=icons[arr[0].weather[0].icon]||"fas fa-cloud";
    const desc=arr[0].weather[0].description;
    const d=new Date(arr[0].dt*1000).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
    return `
      <div class="forecast-card">
        <div class="forecast-date">${d}</div>
        <i class="forecast-icon ${icon}"></i>
        <div class="forecast-temp">${Math.round(min)}° / ${Math.round(max)}°C</div>
        <div class="desc">${desc}</div>
      </div>
    `;
  }).join("");
}

searchBtn.addEventListener("click",()=>{
  const city=cityInput.value.trim();
  if(city) fetchWeather(city);
});
cityInput.addEventListener("keypress",e=>{if(e.key==="Enter") searchBtn.click();});

fetchWeather("London");
