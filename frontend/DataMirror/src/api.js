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

export const compareSqlQueries = async (payload) => {
  console.log('Payload:', payload);
try {
  const response = await axios.post(`${BASE_URL}/compare-queries`, payload);
  return response.data;
} catch (error) {
  console.error('API error:', error);
  throw error.response?.data || { error: 'Unknown error occurred' };
}
};


export const fetchComparisonResults = async (filename) => {
  try {
    const response = await axios.get(`${BASE_URL}/result/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comparison results:', error);
    throw error;
  }
};


export const fetchExecutionHistory = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/execution-history`);
    // console.log(response)
    return response.data;
  } catch (error) {
    console.error('Error fetching execution history:', error);
    throw error;
  }
};