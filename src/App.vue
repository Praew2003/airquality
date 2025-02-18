<template>
  <div class="container">
    <h1>🌍 ค่าฝุ่นในอากาศ</h1>
    <button @click="fetchAirQuality">ดึงข้อมูลค่าฝุ่น</button>
    <div v-if="airQuality">
      <h2>คุณภาพอากาศ: {{ airQuality.aqi }}</h2>
      <p>PM2.5: {{ airQuality.pm2_5 }} µg/m³</p>
      <p>PM10: {{ airQuality.pm10 }} µg/m³</p>
      <p>CO: {{ airQuality.co }} µg/m³</p>
      <p>สถานี: {{ airQuality.station }}</p>
    </div>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { getAirQuality } from "./services/AirQualityService";

export default {
  data() {
    return {
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
      if (data && data.status === "success") {
        this.airQuality = {
          aqi: data.data.current.pollution.aqius,
          pm2_5: data.data.current.pollution.pm25,
          pm10: data.data.current.pollution.pm10,
          co: data.data.current.pollution.co,
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
button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
}
</style>
