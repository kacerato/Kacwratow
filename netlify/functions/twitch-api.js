const axios = require('axios');

exports.handler = async function(event, context) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const accessToken = process.env.TWITCH_ACCESS_TOKEN;
  const { endpoint } = JSON.parse(event.body);

  try {
    const response = await axios.get(`https://api.twitch.tv/helix/${endpoint}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from Twitch API' })
    };
  }
}

