<template>
  <div class="container">
    <h1>🌍 ค่าฝุ่นในอากาศ</h1>

    <!-- ช่องค้นหาชื่อเมือง -->
    <div>
      <input 
        v-model="searchCity" 
        type="text" 
        placeholder="ค้นหาชื่อเมือง"
        @keyup.enter="fetchAirQuality" 
      />
      <button @click="fetchAirQuality">ค้นหาค่าฝุ่น</button>
    </div>

    <div v-if="airQuality">
      <h2>📍 เมือง: {{ airQuality.city }}</h2>
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
      searchCity: "",  // ตัวแปรเก็บชื่อเมืองที่ผู้ใช้กรอก
      airQuality: null,
      error: null
    };
  },
  methods: {
 async fetchAirQuality() {
  const city = this.searchCity.trim() || "Bangkok";  // ใช้ชื่อเมืองที่กรอก หรือ Bangkok เป็นดีฟอลต์
  const state = "Bangkok";  // ค่าของ state ที่ต้องการ
  const country = "Thailand";  // ค่าของประเทศที่ต้องการ

  console.log("City to search:", city, "State:", state, "Country:", country);  // ตรวจสอบข้อมูลที่ส่งไป

  const translatedCity = city === "กรุงเทพ" ? "Bangkok" : city;

  this.airQuality = null;
  this.error = null;

  try {
    const data = await getAirQuality(translatedCity, state, country);
    console.log("API Response:", data);  // ตรวจสอบข้อมูลที่ตอบกลับจาก API

    if (data && data.status === "success") {
      this.airQuality = {
        city: data.data.city,
        aqi: data.data.current.pollution.aqius,
        main_pollutant: data.data.current.pollution.mainus,
        temperature: data.data.current.weather.tp,
        pressure: data.data.current.weather.pr,
        humidity: data.data.current.weather.hu,
        wind_speed: data.data.current.weather.ws,
        station: data.data.city
      };
    } else {
      this.error = "ไม่สามารถดึงข้อมูลค่าฝุ่นได้";
    }
  } catch (err) {
    this.error = "เกิดข้อผิดพลาดในการเชื่อมต่อกับ API";
    console.error(err);
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
