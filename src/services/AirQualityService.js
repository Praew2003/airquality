import axios from "axios";

const API_KEY = "8bf06638-40e7-4aaf-922b-10a691d55b28";
const BASE_URL ="https://api.airvisual.com/v2/nearest_city";


export async function getAirQuality(city, state, country) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                city: city,
                state: state,
                country: country,
                key: API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching air quality data:", error.response?.data || error.message);
        return null;
    }
}
