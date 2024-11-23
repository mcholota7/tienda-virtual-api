const openai = require('./openaiService'); 

(async () => {
    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Hola, ¿cómo estás?' }],
        });
        console.log('Respuesta:', response.data.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
