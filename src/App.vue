<template>
    <div class="container mx-auto p-4 max-w-2xl">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-center mb-6">🌍 ค่าคุณภาพอากาศในประเทศไทย</h1>
        
        <!-- Search with Dropdown -->
        <div class="relative mb-4">
          <input
            type="text"
            v-model="searchTerm"
            @input="handleSearch"
            placeholder="พิมพ์ชื่อจังหวัด..."
            class="w-full p-3 border rounded-lg pl-10"
          />
          <span class="absolute left-3 top-3 text-gray-400">
            🔍
          </span>
          
          <!-- Dropdown Results -->
          <div v-if="showDropdown && filteredProvinces.length > 0" 
               class="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              v-for="province in filteredProvinces"
              :key="province"
              @click="selectProvince(province)"
              class="p-3 hover:bg-gray-100 cursor-pointer"
            >
              {{ province }}
            </div>
          </div>
        </div>
  
        <button 
          @click="fetchAirQuality"
          :disabled="loading"
          class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 mb-4"
        >
          {{ loading ? 'กำลังโหลด...' : 'ดึงข้อมูล' }}
        </button>
  
        <!-- Error Message -->
        <div v-if="error" class="p-4 bg-red-100 text-red-800 rounded-lg mb-4">
          {{ error }}
        </div>
  
        <!-- Air Quality Data -->
        <div v-if="airQuality" class="space-y-4">
          <!-- AQI Level -->
          <div :class="[getAqiClass(airQuality.aqi), 'p-4 rounded-lg']">
            <p class="text-lg font-semibold">
              คุณภาพอากาศ (AQI): {{ airQuality.aqi }}
            </p>
            <p>ระดับ: {{ getAqiLevel(airQuality.aqi) }}</p>
            <p class="mt-2 text-sm">{{ getHealthAdvice(airQuality.aqi) }}</p>
          </div>
  
          <!-- Detailed Data -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Pollutants -->
            <div class="p-4 bg-gray-100 rounded-lg space-y-2">
              <h3 class="font-semibold">ข้อมูลมลพิษทางอากาศ</h3>
              <p>🔬 สารมลพิษหลัก: {{ getPollutantThai(airQuality.main_pollutant) }}</p>
              <template v-for="(value, key) in airQuality.pollutants" :key="key">
                <div v-if="value !== null && value !== undefined" class="flex justify-between items-center">
                  <span>{{ getPollutantThai(key) }}:</span>
                  <div class="flex items-center">
                    <span class="mr-2">{{ value.toFixed(1) }} µg/m³</span>
                    <div class="w-2 h-2 rounded-full" :class="getPollutantLevelClass(key, value)"></div>
                  </div>
                </div>
              </template>
            </div>
  
            <!-- Weather -->
            <div class="p-4 bg-gray-100 rounded-lg space-y-2">
              <h3 class="font-semibold">ข้อมูลสภาพอากาศ</h3>
              <p>🌡️ อุณหภูมิ: {{ airQuality.weather.temperature }}°C</p>
              <p>💨 ความเร็วลม: {{ (airQuality.weather.wind_speed * 3.6).toFixed(1) }} km/h</p>
              <p>🧭 ทิศทางลม: {{ getWindDirection(airQuality.weather.wind_direction) }}</p>
              <p>💦 ความชื้น: {{ airQuality.weather.humidity }}%</p>
              <p>🌅 ความกดอากาศ: {{ airQuality.weather.pressure }} hPa</p>
              <p v-if="airQuality.weather.precipitation !== null">
                🌧️ ปริมาณน้ำฝน: {{ airQuality.weather.precipitation }} mm
              </p>
            </div>
          </div>
  
          <!-- Health Recommendations -->
          <div class="p-4 bg-blue-50 rounded-lg mt-4">
            <h3 class="font-semibold mb-2">คำแนะนำสำหรับสุขภาพ</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li v-for="(rec, index) in getHealthRecommendations(airQuality.aqi)" 
                  :key="index" 
                  class="text-sm">
                {{ rec }}
              </li>
            </ul>
          </div>
  
          <!-- Additional Information -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold mb-2">ข้อมูลเพิ่มเติม</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="font-medium">ดัชนีคุณภาพอากาศ (AQI)</p>
                <ul class="list-none space-y-1 mt-1">
                  <li>0-50: คุณภาพดี</li>
                  <li>51-100: ปานกลาง</li>
                  <li>101-150: ไม่ดีต่อสุขภาพ</li>
                  <li>151-200: อันตราย</li>
                  <li>>200: อันตรายอย่างยิ่ง</li>
                </ul>
              </div>
              <div>
                <p class="font-medium">แหล่งข้อมูล</p>
                <ul class="list-none space-y-1 mt-1">
                  <li>🏢 สถานีตรวจวัด: {{ airQuality.station }}</li>
                  <li>⏰ อัพเดทล่าสุด: {{ new Date(airQuality.timestamp).toLocaleString('th-TH') }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        searchTerm: '',
        selectedProvince: '',
        showDropdown: false,
        airQuality: null,
        error: null,
        loading: false,
        apiKey: '8bf06638-40e7-4aaf-922b-10a691d55b28',
        provinces: [
          'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
          'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ',
          'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด',
          'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา',
          'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
          'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี',
          'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร',
          'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'พะเยา',
          'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยะลา',
          'ยโสธร', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
          'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ',
          'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
          'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย',
          'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู',
          'อ่างทอง', 'อุดรธานี', 'อุทัยธานี', 'อุตรดิตถ์', 'อุบลราชธานี',
          'อำนาจเจริญ', 'กรุงเทพมหานคร'
        ],
        provinceMap: {
          'กระบี่': { state: 'Krabi', city: 'Krabi' },
          'กาญจนบุรี': { state: 'Kanchanaburi', city: 'Kanchanaburi' },
          'กาฬสินธุ์': { state: 'Kalasin', city: 'Kalasin' },
          'กำแพงเพชร': { state: 'Kamphaeng Phet', city: 'Kamphaeng Phet' },
          'ขอนแก่น': { state: 'Khon Kaen', city: 'Khon Kaen' },
          'จันทบุรี': { state: 'Chanthaburi', city: 'Chanthaburi' },
          'ฉะเชิงเทรา': { state: 'Chachoengsao', city: 'Chachoengsao' },
          'ชลบุรี': { state: 'Chonburi', city: 'Chonburi' },
          'ชัยนาท': { state: 'Chai Nat', city: 'Chai Nat' },
          'ชัยภูมิ': { state: 'Chaiyaphum', city: 'Chaiyaphum' },
          'ชุมพร': { state: 'Chumphon', city: 'Chumphon' },
          'เชียงราย': { state: 'Chiang Rai', city: 'Chiang Rai' },
          'เชียงใหม่': { state: 'Chiang Mai', city: 'Chiang Mai' },
          'ตรัง': { state: 'Trang', city: 'Trang' },
          'ตราด': { state: 'Trat', city: 'Trat' },
          'ตาก': { state: 'Tak', city: 'Tak' },
          'นครนายก': { state: 'Nakhon Nayok', city: 'Nakhon Nayok' },
          'นครปฐม': { state: 'Nakhon Pathom', city: 'Nakhon Pathom' },
          'นครพนม': { state: 'Nakhon Phanom', city: 'Nakhon Phanom' },
          'นครราชสีมา': { state: 'Nakhon Ratchasima', city: 'Nakhon Ratchasima' },
          'นครศรีธรรมราช': { state: 'Nakhon Si Thammarat', city: 'Nakhon Si Thammarat' },
          'นครสวรรค์': { state: 'Nakhon Sawan', city: 'Nakhon Sawan' },
          'นนทบุรี': { state: 'Nonthaburi', city: 'Nonthaburi' },
          'นราธิวาส': { state: 'Narathiwat', city: 'Narathiwat' },
          'น่าน': { state: 'Nan', city: 'Nan' },
          'บึงกาฬ': { state: 'Bueng Kan', city: 'Bueng Kan' },
          'บุรีรัมย์': { state: 'Buriram', city: 'Buriram' },
          'ปทุมธานี': { state: 'Pathum Thani', city: 'Pathum Thani' },
          'ประจวบคีรีขันธ์': { state: 'Prachuap Khiri Khan', city: 'Prachuap Khiri Khan' },
          'ปราจีนบุรี': { state: 'Prachinburi', city: 'Prachinburi' },
          'ปัตตานี': { state: 'Pattani', city: 'Pattani' },
          'พระนครศรีอยุธยา': { state: 'Ayutthaya', city: 'Ayutthaya' },
          'พังงา': { state: 'Phang Nga', city: 'Phang Nga' },
          'พัทลุง': { state: 'Phatthalung', city: 'Phatthalung' },
          'พิจิตร': { state: 'Phichit', city: 'Phichit' },
          'พิษณุโลก': { state: 'Phitsanulok', city: 'Phitsanulok' },
          'เพชรบุรี': { state: 'Phetchaburi', city: 'Phetchaburi' },
          'เพชรบูรณ์': { state: 'Phetchabun', city: 'Phetchabun' },
          'แพร่': { state: 'Phrae', city: 'Phrae' },
          'พะเยา': { state: 'Phayao', city: 'Phayao' },
          'ภูเก็ต': { state: 'Phuket', city: 'Phuket' },
          'มหาสารคาม': { state: 'Maha Sarakham', city: 'Maha Sarakham' },
          'มุกดาหาร': { state: 'Mukdahan', city: 'Mukdahan' },
          'แม่ฮ่องสอน': { state: 'Mae Hong Son', city: 'Mae Hong Son' },
          'ยะลา': { state: 'Yala', city: 'Yala' },
          'ยโสธร': { state: 'Yasothon', city: 'Yasothon' },
          'ร้อยเอ็ด': { state: 'Roi Et', city: 'Roi Et' },
          'ระนอง': { state: 'Ranong', city: 'Ranong' },
          'ระยอง': { state: 'Rayong', city: 'Rayong' },
          'ราชบุรี': { state: 'Ratchaburi', city: 'Ratchaburi' },
          'ลพบุรี': { state: 'Lopburi', city: 'Lopburi' },
          'ลำปาง': { state: 'Lampang', city: 'Lampang' },
          'ลำพูน': { state: 'Lamphun', city: 'Lamphun' },
          'เลย': { state: 'Loei', city: 'Loei' },
          'ศรีสะเกษ': { state: 'Sisaket', city: 'Si Sa Ket' }, // เปลี่ยนจาก Sisaket เป็น Si Sa Ket
          'สกลนคร': { state: 'Sakon Nakhon', city: 'Sakon Nakhon' },
          'สงขลา': { state: 'Songkhla', city: 'Songkhla' },
          'สตูล': { state: 'Satun', city: 'Satun' },
          'สมุทรปราการ': { state: 'Samut Prakan', city: 'Samut Prakan' },
          'สมุทรสงคราม': { state: 'Samut Songkhram', city: 'Samut Songkhram' },
          'สมุทรสาคร': { state: 'Samut Sakhon', city: 'Samut Sakhon' },
          'สระแก้ว': { state: 'Sa Kaeo', city: 'Sa Kaeo' },
          'สระบุรี': { state: 'Saraburi', city: 'Saraburi' },
          'สิงห์บุรี': { state: 'Sing Buri', city: 'Sing Buri' },
          'สุโขทัย': { state: 'Sukhothai', city: 'Sukhothai' },
          'สุพรรณบุรี': { state: 'Suphan Buri', city: 'Suphan Buri' },
          'สุราษฎร์ธานี': { state: 'Surat Thani', city: 'Surat Thani' },
          'สุรินทร์': { state: 'Surin', city: 'Surin' },
          'หนองคาย': { state: 'Nong Khai', city: 'Nong Khai' },
          'หนองบัวลำภู': { state: 'Nong Bua Lamphu', city: 'Nong Bua Lamphu' },
          'อ่างทอง': { state: 'Ang Thong', city: 'Ang Thong' },
          'อุดรธานี': { state: 'Udon Thani', city: 'Udon Thani' },
          'อุทัยธานี': { state: 'Uthai Thani', city: 'Uthai Thani' },
          'อุตรดิตถ์': { state: 'Uttaradit', city: 'Uttaradit' },
          'อุบลราชธานี': { state: 'Ubon Ratchathani', city: 'Ubon Ratchathani' },
          'อำนาจเจริญ': { state: 'Amnat Charoen', city: 'Amnat Charoen' },
          'กรุงเทพมหานคร': { state: 'Bangkok', city: 'Bangkok' }
        },
        pollutantThresholds: {
          pm25: { good: 12, moderate: 35.4, unhealthy: 55.4, veryUnhealthy: 150.4, hazardous: 250.4 },
          pm10: { good: 54, moderate: 154, unhealthy: 254, veryUnhealthy: 354, hazardous: 424 },
          o3: { good: 54, moderate: 124, unhealthy: 164, veryUnhealthy: 204, hazardous: 404 },
          no2: { good: 53, moderate: 100, unhealthy: 360, veryUnhealthy: 649, hazardous: 1249 },
          so2: { good: 35, moderate: 75, unhealthy: 185, veryUnhealthy: 304, hazardous: 604 },
          co: { good: 4.4, moderate: 9.4, unhealthy: 12.4, veryUnhealthy: 15.4, hazardous: 30.4 }
        }
      }
    },
  
    computed: {
      filteredProvinces() {
        if (!this.searchTerm) return [];
        const searchLower = this.searchTerm.toLowerCase();
        return this.provinces.filter(province => 
          province.toLowerCase().includes(searchLower)
        );
      }
    },
  
    methods: {
      handleSearch() {
        this.showDropdown = true;
      },
  
      selectProvince(province) {
        this.searchTerm = province;
        this.selectedProvince = province;
        this.showDropdown = false;
      },
  
      
  
      // ฟังก์ชันสำหรับดึงพิกัดของจังหวัด
      async getProvinceCoordinates(provinceName) {
        // สามารถนำมาจากฐานข้อมูลหรือ API ภายนอก เช่น OpenStreetMap Nominatim
        // สำหรับตัวอย่างนี้ ใช้พิกัดที่กำหนดไว้ล่วงหน้าสำหรับบางจังหวัด
        const coordinates = {
          'Bangkok': { lat: 13.7563, lon: 100.5018 },
          'Chiang Mai': { lat: 18.7883, lon: 98.9853 },
          'Phuket': { lat: 7.9519, lon: 98.3381 },
          'Sisaket': { lat: 15.1186, lon: 104.3228 }, // พิกัดศรีสะเกษ
          'Si Sa Ket': { lat: 15.1186, lon: 104.3228 } // พิกัดศรีสะเกษ (ชื่อทางเลือก)
        };
        
        // ถ้ามีพิกัดในฐานข้อมูล
        if (coordinates[provinceName]) {
          return coordinates[provinceName];
        }
        
        // ถ้าไม่มีในฐานข้อมูล อาจใช้ API ภายนอกช่วยค้นหา (ในที่นี้จะส่งคืน null)
        return null;
      },
  
      getPollutantThai(pollutant) {
        const pollutants = {
          'pm25': 'ฝุ่น PM2.5',
          'p2': 'ฝุ่น PM2.5', // เพิ่มการแมปสำหรับ p2
          'pm10': 'ฝุ่น PM10',
          'p1': 'ฝุ่น PM10', // เพิ่มการแมปสำหรับ p1
          'o3': 'โอโซน',
          'no2': 'ไนโตรเจนไดออกไซด์',
          'so2': 'ซัลเฟอร์ไดออกไซด์',
          'co': 'คาร์บอนมอนอกไซด์'
        };
        return pollutants[pollutant] || pollutant;
      },
  
      getWindDirection(degrees) {
        const directions = ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้',
                           'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'];
        const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
        return directions[index];
      },
  
      getAqiLevel(aqi) {
        if (aqi <= 50) return 'ดี';
        if (aqi <= 100) return 'ปานกลาง';
        if (aqi <= 150) return 'ไม่ดีต่อสุขภาพ';
        if (aqi <= 200) return 'อันตราย';
        return 'อันตรายอย่างยิ่ง';
      },
  
      getAqiClass(aqi) {
        if (aqi <= 50) return 'bg-green-100 text-green-800';
        if (aqi <= 100) return 'bg-yellow-100 text-yellow-800';
        if (aqi <= 150) return 'bg-orange-100 text-orange-800';
        if (aqi <= 200) return 'bg-red-100 text-red-800';
        return 'bg-purple-100 text-purple-800';
      },
  
      getPollutantLevelClass(pollutant, value) {
        const thresholds = this.pollutantThresholds[pollutant];
        if (!thresholds) return 'bg-gray-500';
  
        if (value <= thresholds.good) return 'bg-green-500';
        if (value <= thresholds.moderate) return 'bg-yellow-500';
        if (value <= thresholds.unhealthy) return 'bg-orange-500';
        if (value <= thresholds.veryUnhealthy) return 'bg-red-500';
        return 'bg-purple-500';
      },
  
      getHealthAdvice(aqi) {
        if (aqi <= 50) return 'คุณภาพอากาศดี เหมาะสำหรับกิจกรรมกลางแจ้ง';
        if (aqi <= 100) return 'คุณภาพอากาศปานกลาง ควรลดการทำกิจกรรมกลางแจ้งที่ใช้เวลานาน';
        if (aqi <= 150) return 'คุณภาพอากาศไม่ดีต่อกลุ่มเสี่ยง ควรหลีกเลี่ยงการออกนอกอาคาร';
        if (aqi <= 200) return 'คุณภาพอากาศอยู่ในเกณฑ์อันตราย ควรหลีกเลี่ยงกิจกรรมกลางแจ้ง';
        return 'คุณภาพอากาศอันตรายมาก ไม่ควรออกนอกอาคารโดยไม่จำเป็น';
      },
  
      getHealthRecommendations(aqi) {
        if (aqi <= 50) {
          return [
            'สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ',
            'เหมาะสำหรับการออกกำลังกายกลางแจ้ง',
            'คุณภาพอากาศดีต่อสุขภาพ'
          ];
        } else if (aqi <= 100) {
          return [
            'ผู้ที่มีโรคระบบทางเดินหายใจควรลดการออกกำลังกายกลางแจ้ง',
            'ควรสังเกตอาการผิดปกติของร่างกาย',
            'ควรพกหน้ากากอนามัยติดตัว'
          ];
        } else if (aqi <= 150) {
          return [
            'หลีกเลี่ยงการออกกำลังกายกลางแจ้ง',
            'เด็ก ผู้สูงอายุ และผู้ป่วยควรอยู่ในอาคาร',
            'ควรสวมหน้ากากอนามัยเมื่อออกนอกอาคาร',
            'ปิดประตูหน้าต่างเพื่อป้องกันฝุ่นละออง'
          ];
        } else if (aqi <= 200) {
          return [
            'ทุกคนควรหลีกเลี่ยงกิจกรรมกลางแจ้ง',
            'ควรสวมหน้ากาก N95 เมื่อต้องออกนอกอาคาร',
            'ควรใช้เครื่องฟอกอากาศในอาคาร',
            'หากมีอาการผิดปกติควรพบแพทย์'
          ];
        } else {
          return [
            'งดกิจกรรมกลางแจ้งทุกชนิด',
            'สวมหน้ากาก N95 ตลอดเวลาเมื่ออยู่นอกอาคาร',
            'ผู้ป่วยและกลุ่มเสี่ยงควรย้ายไปอยู่ในพื้นที่ที่มีคุณภาพอากาศดีกว่า',
            'ติดตามประกาศเตือนจากหน่วยงานที่เกี่ยวข้อง'
          ];
        }
      },
  
      async fetchAirQuality() {
        if (!this.selectedProvince) {
          this.error = "กรุณาเลือกจังหวัด";
          return;
        }
  
        this.loading = true;
        this.error = null;
        
        const provinceData = this.provinceMap[this.selectedProvince];
        if (!provinceData) {
          this.error = `ไม่พบข้อมูลการแมปสำหรับจังหวัด ${this.selectedProvince}`;
          this.loading = false;
          return;
        }
        
        try {
          // ลองเรียก API แบบใช้ city และ state
          let url = `https://api.airvisual.com/v2/city?city=${provinceData.city}&state=${provinceData.state}&country=Thailand&key=${this.apiKey}`;
          let response = await fetch(url);
          let data = await response.json();
          
          // ถ้าไม่สำเร็จ ลองใช้ nearest_city API
          if (data.status !== "success" && data.data?.message?.includes("city_not_found")) {
            const coordinates = await this.getProvinceCoordinates(provinceData.state);
            if (coordinates) {
              url = `https://api.airvisual.com/v2/nearest_city?lat=${coordinates.lat}&lon=${coordinates.lon}&key=${this.apiKey}`;
              response = await fetch(url);
              data = await response.json();
            }
          }
          
          if (data.status === "success") {
            const pollution = data.data.current.pollution || {};
            const weather = data.data.current.weather || {};
            
            // เพิ่มข้อมูลคุณภาพอากาศแบบละเอียด
            this.airQuality = {
              aqi: pollution.aqius || 0,
              main_pollutant: pollution.mainus || '',
              pollutants: {
                pm25: pollution.pm25 !== undefined ? pollution.pm25 : null,
                pm10: pollution.pm10 !== undefined ? pollution.pm10 : null,
                o3: pollution.o3 !== undefined ? pollution.o3 : null,
                no2: pollution.no2 !== undefined ? pollution.no2 : null,
                so2: pollution.so2 !== undefined ? pollution.so2 : null,
                co: pollution.co !== undefined ? pollution.co : null
              },
              weather: {
                temperature: weather.tp !== undefined ? weather.tp : 0,
                pressure: weather.pr !== undefined ? weather.pr : 0,
                humidity: weather.hu !== undefined ? weather.hu : 0,
                wind_speed: weather.ws !== undefined ? weather.ws : 0,
                wind_direction: weather.wd !== undefined ? weather.wd : 0,
                precipitation: weather.ic !== undefined ? weather.ic : null
              },
              pollutant_details: {
                pm25: {
                  concentration: pollution.pm25,
                  aqi: this.calculateAQI('pm25', pollution.pm25)
                },
                pm10: {
                  concentration: pollution.pm10,
                  aqi: this.calculateAQI('pm10', pollution.pm10)
                },
                o3: {
                  concentration: pollution.o3,
                  aqi: this.calculateAQI('o3', pollution.o3)
                },
                no2: {
                  concentration: pollution.no2,
                  aqi: this.calculateAQI('no2', pollution.no2)
                },
                so2: {
                  concentration: pollution.so2,
                  aqi: this.calculateAQI('so2', pollution.so2)
                },
                co: {
                  concentration: pollution.co,
                  aqi: this.calculateAQI('co', pollution.co)
                }
              },
              station: data.data.city || this.selectedProvince,
              timestamp: new Date().toISOString()
            };
          } else {
            this.error = `ไม่พบข้อมูลคุณภาพอากาศสำหรับจังหวัด ${this.selectedProvince} (${data.data?.message || 'ข้อผิดพลาดไม่ระบุ'})`;
          }
        } catch (err) {
          this.error = `ไม่สามารถดึงข้อมูลคุณภาพอากาศได้: ${err.message}`;
        } finally {
          this.loading = false;
        }
      },
  
      calculateAQI(pollutant, concentration) {
        if (concentration === null || concentration === undefined) return null;
        
        const thresholds = this.pollutantThresholds[pollutant];
        if (!thresholds) return null;
  
        // คำนวณ AQI ตามเกณฑ์มาตรฐาน
        const ranges = [
          { min: 0, max: thresholds.good, aqiMin: 0, aqiMax: 50 },
          { min: thresholds.good, max: thresholds.moderate, aqiMin: 51, aqiMax: 100 },
          { min: thresholds.moderate, max: thresholds.unhealthy, aqiMin: 101, aqiMax: 150 },
          { min: thresholds.unhealthy, max: thresholds.veryUnhealthy, aqiMin: 151, aqiMax: 200 },
          { min: thresholds.veryUnhealthy, max: thresholds.hazardous, aqiMin: 201, aqiMax: 300 },
          { min: thresholds.hazardous, max: Infinity, aqiMin: 301, aqiMax: 500 }
        ];
  
        for (const range of ranges) {
          if (concentration <= range.max) {
            return Math.round(
              ((range.aqiMax - range.aqiMin) / (range.max - range.min)) *
              (concentration - range.min) +
              range.aqiMin
            );
          }
        }
        
        return 500; // Maximum AQI value
      }
    },
  
    mounted() {
      document.addEventListener('click', this.handleClickOutside);
    },
  
    beforeUnmount() {
      document.removeEventListener('click', this.handleClickOutside);
    }
  }
  </script>
  
  <style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>