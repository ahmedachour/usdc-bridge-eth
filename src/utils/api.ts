import axios from 'axios';


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const pollAttestationStatus = async (messageHash: string, retries = 10, interval = 5000) => {
  const options = {
    method: 'GET',
    url: `https://iris-api-sandbox.circle.com/v1/attestations/${messageHash}`,
    headers: { accept: 'application/json' }
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.request(options);
      if (response.status === 200) {
        const data = response.data;
        if (data.status === 'complete') {
          return data;
        } else {
          console.log('Attestation status is pending. Retrying...');
        }
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error('Message hash not found. Retrying...');
      } else {
        console.error('Error fetching attestation:', error);
      }
    }

    await delay(interval);
  }

  throw new Error('Failed to fetch attestation after multiple attempts');
}


// Function to mint USDC on Ethereum Sepolia
export const mintUSDC = async (transactionHash: string, sourceDomain: string) => {
  try {
    const options = {
      method: 'GET',
      url: `https://iris-api-sandbox.circle.com/v1/messages/${sourceDomain}/${transactionHash}`,
      headers: { accept: 'application/json' }
    };

    try {
      const response = await axios.request(options);
      return response.data.messages[0];
    } catch (error: any) {
        console.error('Error fetching attestation:', error);
    }

  } catch (error) {
    console.error('Error minting USDC on Ethereum:', error);
    return { success: false, error: error };
  }
};