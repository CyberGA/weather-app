console.log("WindScrib v1.0.0");

const API_KEY = "9abf6c1d65810f7cff7b00a188f26a66";

async function getUserGeoLocation() {
  return new Promise((resolve, reject) => {
    const geoLocation = checkGeoLocation();

    //   if no geolocation
    if (geoLocation === null)
      return rej("Browser does not support geolocation");

    geoLocation.getCurrentPosition(
      (position) => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        // console.log(`Latitude: ${lat}, Longitude: ${lon}`);
        resolve({ lat: lat, lon: lon });
      },
      (err) => {
        if (err.PERMISSION_DENIED) {
          return reject("WindScrib needs to get access to your location");
        }
        if (err.POSITION_UNAVAILABLE) {
          return reject("Location unavailable");
        }
        return reject(err.message);
      }
    );
  });
}

function checkGeoLocation() {
  if (navigator.geolocation) {
    return navigator.geolocation;
  } else {
    alert("Feature not available");
    return null;
  }
}

async function getWeatherInfoByGeoLocation({ lat, lon }) {
  if (!lat || !lon) return alert("Location access is required");

  const param = `lat=${lat}&lon=${lon}`;

  const url = `https://api.openweathermap.org/data/2.5/weather?${param}&appid=${API_KEY}&units=metric`;

  const weatherResponse = await fetch(url);

  const weatherData = await weatherResponse.json();

  console.log(weatherData);

  updateWeatherReport(weatherData);
}

async function getWeatherInfoByCity(city) {
  if (!city) alert("City name is required, default is Canada");

  const param = `q=${city || "Canada"}`;

  const url = `https://api.openweathermap.org/data/2.5/weather?${param}&appid=${API_KEY}&units=metric`;

  const weatherResponse = await fetch(url);

  const weatherData = await weatherResponse.json();

  console.log(weatherData);

  updateWeatherReport(weatherData);
}

function getElem(id = "") {
  if (!id) throw "element is required";

  return document.getElementById(id);
}

function updateWeatherReport(data) {
  const lat = data.coord.lat;
  const lon = data.coord.lon;
  const temp = data.main.temp;
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const speed = data.wind.speed;
  const location = data.name + ", " + data.sys.country;
  const description = data.weather[0].description;
  const _feels_like = data.main.feels_like;
  const weatherCondition = predictWeatherCondition(temp);

  setWeatherImage(weatherCondition);

  getElem("status").textContent = `Status: ${description}`;
  getElem("feels").innerHTML = `Feels like: ${_feels_like}<sup>°C</sup>`;
  getElem("temp").innerHTML = temp + "<sup>°C</sup>";
  getElem("location").textContent = location;
  getElem("desc").textContent = "It's " + weatherCondition;
  // getElem("desc").textContent = description;
  getElem("lat").textContent =`Latitude: ${lat} °` ;
  getElem("lon").textContent = `Longitude: ${lon} °` ;
  getElem("humidity").innerHTML = `Humidity: ${humidity}<small>g/cm<sup>3</sup></small>`;
  getElem("pressure").innerHTML = `Pressure: ${pressure}<small>atm</small>`;
  getElem("speed").innerHTML = `Speed: ${speed}<small>m/s</small>`;
}

// raining | sunny | mixBlendMode:
function predictWeatherCondition(temperature = 0) {
  if (temperature < 20) return "raining";
  if (temperature < 35) return "mixed";
  return "sunny";
}

function setWeatherImage(weatherCondition) {
  const imageHtmlElement = getElem("weather-img");

  if (weatherCondition === "raining")
    return (imageHtmlElement.src = "./image/cloudy.png");

  if (weatherCondition === "mixed")
    return (imageHtmlElement.src = "./image/mixed.png");

  imageHtmlElement.src = "./image/sun.png";
}

// getUserGeoLocation().then(getWeatherInfoByGeoLocation).catch(alert);

getElem("weather-search-id").addEventListener("click", async (e) => {
  console.log(e.target.id);
  if (e.target.id === "city-name") {
    const city = getElem("get-location").value;

    getWeatherInfoByCity(city);
  }
  if (e.target.id === "get-current-weather") {
    await getWeatherInfoByGeoLocation(await getUserGeoLocation());
  }
});
