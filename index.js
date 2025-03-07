const form = document.querySelector(".form");
const cityinput = document.querySelector(".cityinput");
const countrySelect = document.querySelector(".countrySelect");
const citySelect = document.querySelector(".citySelect"); // Add city select dropdown
const card = document.querySelector(".card");
const apikey = "1d3f63afe3935c376426408754a840d3";
const geoUsername = "YOUR_USERNAME"; // Replace with your GeoNames username

// Fetch country list from GeoNames API
async function fetchCountries() {
    try {
        const response = await fetch(`https://secure.geonames.org/countryInfoJSON?username=${geoUsername}`);
        const data = await response.json();
        if (data.geonames) {
            populateCountryDropdown(data.geonames);
        }
    } catch (error) {
        console.error("Error fetching countries:", error);
    }
}

// Populate country dropdown
function populateCountryDropdown(countries) {
    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country.countryCode;
        option.textContent = country.countryName;
        countrySelect.appendChild(option);
    });
}

// Fetch cities for the selected country
async function fetchCities(countryCode) {
    try {
        const response = await fetch(`https://secure.geonames.org/searchJSON?country=${countryCode}&featureClass=P&maxRows=1000&username=${geoUsername}`);
        const data = await response.json();
        if (data.geonames) {
            populateCityDropdown(data.geonames);
        }
    } catch (error) {
        console.error("Error fetching cities:", error);
    }
}

// Populate city dropdown
function populateCityDropdown(cities) {
    citySelect.innerHTML = "<option value=''>Select a city</option>"; // Clear previous options
    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city.name;
        option.textContent = city.name;
        citySelect.appendChild(option);
    });
    citySelect.disabled = false; // Enable the city dropdown
}

// Event listener for country selection change
countrySelect.addEventListener("change", async () => {
    const selectedCountryCode = countrySelect.value;
    if (selectedCountryCode) {
        await fetchCities(selectedCountryCode);
    } else {
        citySelect.innerHTML = "<option value=''>Select a city</option>";
        citySelect.disabled = true;
    }
});

form.addEventListener("submit", async event => {
    event.preventDefault();
    const city = citySelect.value;
    const countryCode = countrySelect.value;

    if (city && countryCode) {
        try {
            const weatherData = await getWeatherData(city, countryCode);
            displayWeatherinfo(weatherData);
        } catch (error) {
            console.error(error);
            displayError(error.message);
        }
    } else {
        displayError("Please select a country and a city");
    }
});

async function getWeatherData(city, countryCode) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${apikey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Invalid city or country selection");
    }
    return await response.json();
}

function displayWeatherinfo(data) {
    const { name: city, main: { temp, humidity }, weather: [{ description, id }] } = data;
    card.textContent = "";
    card.style.display = "flex";

    const cityDisplay = document.createElement("h2");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${(temp -273.15).toFixed(0)}°C`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getWeatherEmoji(id);

    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    card.appendChild(cityDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);
    card.appendChild(weatherEmoji);
}

function getWeatherEmoji(weatherId) {
    switch (true) {
        case (weatherId >= 200 && weatherId < 300): return "⛈️";
        case (weatherId >= 300 && weatherId < 400): return "🌧️";
        case (weatherId >= 500 && weatherId < 600): return "🌧️";
        case (weatherId >= 600 && weatherId < 700): return "❄️";
        case (weatherId >= 700 && weatherId < 800): return "🌫️";
        case (weatherId === 800): return "☀️";
        case (weatherId >= 801 && weatherId < 810): return "☁️";
        default: return "❓";
    }
}

function displayError(message) {
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");
    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorDisplay);
}

// Load countries on page load
fetchCountries();