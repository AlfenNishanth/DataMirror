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


export const fetchComparisonResults = async (filename) => {
  try {
<<<<<<< HEAD
    const full_path = BASE_URL + "/" +filePath.replace(/\\/g, '/'); 
    console.log(full_path)
    const response = await fetch(full_path);    
=======
    const response = await fetch(`${BASE_URL}/result/${filename}`);
    
>>>>>>> 0dcd66d27edd3fc1c5c7c600c5266938ba76e843
    if (!response.ok) {
      throw new Error(`Failed to fetch results file: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comparison results:', error);
    throw error;
  }
};

export const fetchExecutionHistory = async () => {
  try {
    const response = await fetch(`${BASE_URL}/execution-history`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch execution history: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching execution history:', error);
    throw error;
  }
};