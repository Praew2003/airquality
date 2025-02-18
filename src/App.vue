<template>
  <div class="container">
    <h1>🌍 ค่าฝุ่นในอากาศ</h1>
    <button @click="fetchAirQuality">ดึงข้อมูลค่าฝุ่น</button>
    <div v-if="airQuality">
      <h2>คุณภาพอากาศ (AQI): {{ airQuality.aqi }}</h2>
      <p>🔬 สารมลพิษหลัก: {{ airQuality.main_pollutant }}</p>
      <p>🌡️ อุณหภูมิ: {{ airQuality.temperature }}°C</p>
      <p>💨 ความเร็วลม: {{ airQuality.wind_speed }} m/s</p>
      <p>💦 ความชื้น: {{ airQuality.humidity }}%</p>
      <p>🏢 สถานี: {{ airQuality.station }}</p>
    </div>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { getAirQuality } from "./services/AirQualityService";

export default {
  data() {
    return {
      searchCity: "Bangkok", // ค่าเริ่มต้น
      airQuality: null,
      error: null
    };
  },
  methods: {
    async fetchAirQuality() {
  const city = "Bangkok";
  const state = "Bangkok";
  const country = "Thailand";
  this.airQuality = null;
  this.error = null;
  
  const data = await getAirQuality(city, state, country);
  console.log("API Response:", data); // ตรวจสอบโครงสร้าง JSON

  if (data && data.status === "success") {
    this.airQuality = {
      aqi: data.data.current.pollution.aqius,
      main_pollutant: data.data.current.pollution.mainus, // สารมลพิษหลัก
      temperature: data.data.current.weather.tp, // อุณหภูมิ
      pressure: data.data.current.weather.pr, // ความกดอากาศ
      humidity: data.data.current.weather.hu, // ความชื้น
      wind_speed: data.data.current.weather.ws, // ความเร็วลม
      station: data.data.city
    };
  } else {
    this.error = "ไม่สามารถดึงข้อมูลค่าฝุ่นได้";
  }
}

  }
};
</script>

<style>
.container {
  text-align: center;
  font-family: Arial, sans-serif;
}
input {
  margin-top: 10px;
  padding: 8px;
  width: 200px;
}
button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
}
</style>
