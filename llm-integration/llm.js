import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";

const ai = new GoogleGenAI({apiKey: "AIzaSyCZfBqUf_CHyXXH0ODPtNIEi-TkAArEbnw"});

const history = [];

async function Chating(userProblem) {

    history.push({ 
        role:"user",
        parts:[{ text: userProblem}]
    });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: history,
  });

  history.push({
    role:"model",
    parts:[{ text: response.text}]
  })

  console.log(response.text);

}

async function main() {
    const userProblem = readlineSync.question("ask -->");
    await Chating(userProblem);
    main();

}
await main();