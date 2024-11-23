const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: ' ' // This is also the default, can be omitted
});

const openFun=async()=>{
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{"role": "user", "content": "Hello, cuentame un chiste!"}],
    });
    console.log(chatCompletion.choices[0].message);
}

openFun();