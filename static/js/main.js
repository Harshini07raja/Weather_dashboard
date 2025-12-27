// ================= Utility Functions =================
function formatDate(dateObj) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return dateObj.toLocaleDateString(undefined, options);
}

// ================= Display Weather =================
function displayWeather(data) {
    const todayDiv = document.getElementById("todayWeather");
    const now = new Date();

    // Date & Day
    document.getElementById("dateText").textContent = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
    document.getElementById("dayText").textContent = now.toLocaleDateString(undefined, { weekday: 'long' });

    // City
    document.getElementById("cityText").textContent = data.city;

    // Force daytime icon to ensure colorful display
    const icon = (data.icon ?? "01d").replace('n', 'd');

    // Current weather panel
    todayDiv.innerHTML = `
        <p class="text-lg font-semibold mb-2">Current Weather</p>
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" class="mx-auto w-24 h-24 mb-2" alt="Weather Icon">
        <p class="text-3xl font-bold mb-1">${data.temp} °C</p>
        <p class="capitalize text-lg">${data.description}</p>
    `;

    // Extra details
    document.getElementById("humidityText").textContent = `${data.humidity} %`;
    document.getElementById("windText").textContent = `${data.wind} m/s`;
    document.getElementById("feelsText").textContent = `${data.feels_like} °C`;
}

// ================= Display 5-Day Forecast =================
function displayForecast(days) {
    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";

    let tempLabels = [];
    let tempData = [];

    days.forEach(day => {
        const temp = day.temp ?? 0;
        const icon = (day.icon ?? "01d").replace('n','d'); // Force daytime icons

        tempLabels.push(day.date);
        tempData.push(temp);

        forecastDiv.innerHTML += `
            <div class="bg-white/80 p-2 rounded-xl shadow text-center min-w-[80px] flex-shrink-0">
                <p class="text-xs font-semibold mb-1">${day.date}</p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" class="mx-auto w-16 h-16" alt="Forecast Icon">
                <p class="text-sm mt-1">${temp}°C</p>
            </div>
        `;
    });

    // Temperature Chart (smaller height)
    const canvas = document.getElementById('tempChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.tempChart && typeof window.tempChart.destroy === "function") {
        window.tempChart.destroy();
    }

    window.tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tempLabels,
            datasets: [{
                label: 'Temperature (°C)',
                data: tempData,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                y: { beginAtZero: false, ticks: { stepSize: 1 } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ================= Load Current Location Weather =================
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`/get_weather_by_coords?lat=${lat}&lon=${lon}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    displayWeather(data);
                    fetchForecast(data.city);
                } else {
                    alert("Failed to load current location weather");
                }
            })
            .catch(err => console.error(err));
        }, (err) => console.error(err));
    }
});

// ================= Search Form =================
document.getElementById("weatherForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const city = document.getElementById("city").value.trim();
    if (!city) return;

    fetch(`/get_weather`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `city=${city}`
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
            displayWeather(data);
            fetchForecast(city);
        } else {
            alert(data.error);
        }
    });
});

// ================= Fetch Forecast =================
function fetchForecast(city) {
    fetch(`/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `city=${city}`
    })
    .then(res => res.json())
    .then(days => {
        if (Array.isArray(days)) displayForecast(days);
    });
}
const toggleBtn = document.getElementById("themeToggle");
const body = document.getElementById("mainBody");
const panels = document.querySelectorAll(".light-panel");

let darkMode = false;

toggleBtn.addEventListener("click", () => {
  darkMode = !darkMode;

  if (darkMode) {
    body.classList.add("dark-bg");
    body.classList.remove("from-sky-200", "to-blue-300");

    panels.forEach(p => {
      p.classList.remove("light-panel");
      p.classList.add("dark-panel");
    });

    toggleBtn.textContent = "🌙";
  } else {
    body.classList.remove("dark-bg");
    body.classList.add("from-sky-200", "to-blue-300");

    panels.forEach(p => {
      p.classList.remove("dark-panel");
      p.classList.add("light-panel");
    });

    toggleBtn.textContent = "☀️";
  }
});
