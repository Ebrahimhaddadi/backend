const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEY = 'e772db73c82841d6b40a4c06641870d5';

async function getCoordsForAddress(address) {
  // return {
  //   lat: 40.7484474,
  //   lng: -73.9871516
  // };
  const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${API_KEY}`
  );

  const data = response.data


  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
        'Could not find location for the specified address.',
        422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry;
  console.log(coordinates,"coordinates")

  return coordinates;
}

module.exports = getCoordsForAddress;
