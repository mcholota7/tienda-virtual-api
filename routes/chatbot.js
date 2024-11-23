const express = require('express');
const { askChatbot } = require('./openaiService');
const router = express.Router();

router.post('/chatbot', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'El mensaje es obligatorio.' });
    }

    try {
        const response = await askChatbot(message);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
