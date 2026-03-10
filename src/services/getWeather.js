const axios = require('axios');

async function GetWeather(lat, lon) {
  try {
    const climaResponse = await axios.get(
      'https://api.openweathermap.org/data/3.0/onecall',
      {
      lat,
      lon,
      exclude: 'minutely,hourly',
      lang: 'pt_br',
      appid: "0051ff2b54f1ae466e72cb622eff4bc1",
    }
    );

    return climaResponse.data;
  } catch (error) {
    console.error('Erro ao buscar dados do clima:', error);
    return null;
  }
}

module.exports = GetWeather;