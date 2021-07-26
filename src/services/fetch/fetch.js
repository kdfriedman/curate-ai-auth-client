import axios from 'axios';

// data fetcher util function using axios library
const fetchData = async (params) => {
  try {
    const data = await axios.request(params);
    return [data, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

export default fetchData;
