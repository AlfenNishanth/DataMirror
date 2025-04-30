import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const compareTables = async (payload) => {

    console.log('Payload:', payload);
  try {
    const response = await axios.post(`${BASE_URL}/compare`, payload);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error.response?.data || { error: 'Unknown error occurred' };
  }
};
