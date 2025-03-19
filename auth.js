import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';

// Load environment variables from the .env file
dotenv.config();

const app = express();

// OAuth callback route to handle the redirect after authorization
app.get('/oauth/callback', async (req, res) => {
    const code = req.query.code; // The authorization code passed in the query params

    // Check if the authorization code is provided
    if (!code) {
        return res.status(400).send('Authorization code is missing.');
    }

    try {
        // Exchange the authorization code for an access token
        const response = await axios.post('https://www.wix.com/oauth/access_token', null, {
            params: {
                code: code,
                client_id: process.env.CLIENT_ID,  // Use environment variables for security
                client_secret: process.env.CLIENT_SECRET,  // Use environment variables for security
                redirect_uri: 'https://oauth.pstmn.io/v1/callback'  // The redirect URI should match the one in your Wix app settings
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // Set the correct content type
            }
        });

        const accessToken = response.data.access_token; // Get the access token from the response
        const refreshToken = response.data.refresh_token; // Get the refresh token

        // Optionally, you can store the access token in a session or database
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // Respond with a success message or redirect to your frontend
        res.send('OAuth authentication successful!');

        // If you need to fetch product data, you can call another function here using the access token
        await fetchProductOptions(accessToken);
    } catch (error) {
        console.error('Error exchanging code for access token:', error);
        res.status(500).send('OAuth authentication failed.');
    }
});

// Fetch product options with the access token
async function fetchProductOptions(accessToken) {
    try {
        // Use the access token for authenticated API requests
        const response = await axios.get('https://www.wix.com/_functions/products/getProductOptionsAvailability', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // Example of logging the fetched product options
        console.log('Fetched product options:', response.data);
    } catch (error) {
        console.error('Error fetching product options:', error);
    }
}

// Start the Express server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
