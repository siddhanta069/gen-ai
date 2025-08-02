import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";

const ai = new GoogleGenAI({apiKey: "AIzaSyCZfBqUf_CHyXXH0ODPtNIEi-TkAArEbnw"});

const History = [];

function sum({num1, num2}) {
    return num1 + num2;
}

function checkPrime({num}) {
    if(num <=1) return false;
    for(let i=2; i<=Math.sqrt(num); i++) {
        if(num % i === 0) return false;
    }
    return true; 
}

async function getCryptoPrice({coin}) {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`)
        .then(response => response.json())
    return res;
}

const sumDeclaration = {
    name: "sum",
    description: "Calculate the sum of two numbers",
    parameters: {
        type: "OBJECT",
        properties: {
            num1: {
                type:"NUMBER",
                description: "The first number to sum"
            },
            num2: {
                type:"NUMBER",
                description: "The second number to sum"
            },
        },
        required: ["num1", "num2"]
    }
}
const primeDeclaration = {
    name: "checkPrime",
    description: "get the num is prime or not",
    parameters: {
        type: "OBJECT",
        properties: {
            num: {
                type:"NUMBER",
                description: "The number to check prime"
            },
        },
        required: ["num"]
    }
}
const cryptoDeclaration = {
    name: "getCryptoPrice",
    description: "Get the current price of a cryptocurrency",
    parameters: {
        type: "OBJECT",
        properties: {
            coin: {
                type:"string",
                description: "the name of the cryptocurrency to get the price for, e.g., 'bitcoin', 'ethereum'"
            },
        },
        required: ["coin"]
    }
}

const availableTools = {
    sum: sum,
    prime: checkPrime, 
    getCryptoPrice: getCryptoPrice
}
async function runAgent(userProblem) {
    History.push({
        role: "user",
        parts: [{ text: userProblem }]
    })

    while(true) {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: History,
            config: {
                systemInstruction: `you are an AI agent, you have access of 3 available tools likes to find sum of 2 numbers, get crypto price of any currency and find a number is prime or not
                
                Use these tools whenever required to confirm user query. 
                if user ask general question you can ans it directly if you don'tneed help of these 3 tools `,
                tools: [ {
                    functionDeclaration: [sumDeclaration, primeDeclaration, cryptoDeclaration ],
                }]
            }
        });

        if(response.functionCalls && response.functionCalls.length > 0) {
            const {name, args} = response.functionCalls[0];

            const funCall = availableTools[name]
            const result = await funCall(args)

            const functinResponsePart = {
                name: name, 
                response: {
                    result: result
                }
            }

            //model
            History.push({
                role: "model", 
                parts: [{
                    functionCall: response.functionCalls[0]
                }]
            })
            //result
            History.push({
                role: "user",
                parts: [{
                    functionResponse: functinResponsePart
                }]
            })
        }
        else {
            History.push({
                role: "model",
                parts: [{ text: response.text }]
            }); 
            console.log(response.text);
            break;
        }
    }
}

async function main() {
    const userProblem = readlineSync.question("ask -->");
    await runAgent(userProblem);
    main();
}

main();