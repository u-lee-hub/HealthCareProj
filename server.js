const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(express.static('public'));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://2c11-35-203-181-137.ngrok-free.app/predict',
            data: {
                question: req.body.message
            },
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API Response:', response.data); // 응답 로깅
        res.json({ message: response.data.prediction });
    } catch (error) {
        console.error('Detailed Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
                url: error.config?.url,
                timeout: error.config?.timeout,
                data: error.config?.data
            }
        });
        
        if (error.code === 'ECONNABORTED') {
            res.status(504).json({ error: '서버 응답 시간이 초과되었습니다.' });
        } else if (error.response) {
            res.status(error.response.status).json({ error: `서버 오류: ${error.response.status}` });
        } else {
            res.status(500).json({ error: `연결 오류: ${error.message}` });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 