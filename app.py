from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_weather', methods=['POST'])
def get_weather():
    city = request.form.get('city')
    print("City received:", city)

    api_key = "8ca90db757ad85ef4f835b5741880316"

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"

    response = requests.get(url)
    print("Status Code:", response.status_code)
    print("API Response:", response.text)

    data = response.json()

    if data.get("cod") != 200:
        return jsonify({"error": data.get("message", "Error occurred")})

    return jsonify({
    "city": data["name"],
    "temp": data["main"]["temp"],
    "description": data["weather"][0]["description"],
    "icon": data["weather"][0]["icon"],
    "humidity": data["main"]["humidity"],
    "feels_like": data["main"]["feels_like"],
    "wind": data["wind"]["speed"]
})

    
@app.route('/forecast', methods=['POST'])
def forecast():
    city = request.form.get('city')
    api_key = "8ca90db757ad85ef4f835b5741880316"

    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={api_key}"
    response = requests.get(url)
    data = response.json()

    print("FORECAST API:", data)  # DEBUG

    if data.get("cod") != "200":
        return jsonify({"error": "Forecast not found"})

    forecast_list = []

    for i in range(0, 40, 8):  # every 24 hours
        forecast_list.append({
            "date": data["list"][i]["dt_txt"].split(" ")[0],
            "temp": data["list"][i]["main"]["temp"],
            "icon": data["list"][i]["weather"][0]["icon"]
        })

    return jsonify(forecast_list)
@app.route('/get_weather_by_coords', methods=['GET'])
def weather_by_coords():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    api_key = "8ca90db757ad85ef4f835b5741880316"

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={api_key}"
    response = requests.get(url).json()

    if response.get("cod") != 200:
        return jsonify({"error": "Location not found"})

    weather_data = {
    'city': response['name'],
    'temp': response['main']['temp'],
    'description': response['weather'][0]['description'],
    'icon': response['weather'][0]['icon'],
    'humidity': response['main']['humidity'],
    'feels_like': response['main']['feels_like'],
    'wind': response['wind']['speed']
   }
    return jsonify(weather_data)


@app.route('/full_forecast')
def full_forecast():
    city = request.args.get("city")
    # call OpenWeatherMap 5-day / 3-hour forecast API
    api_key = "8ca90db757ad85ef4f835b5741880316"
    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={api_key}"
    data = requests.get(url).json()

    if data.get("cod") != "200":
        return jsonify({"error": "City not found"})
    
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
