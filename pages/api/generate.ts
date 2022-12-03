import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  OpenAIApi,
  Configuration, 
  CreateCompletionResponseChoicesInner,
} from 'openai';

type Data = {
  output: CreateCompletionResponseChoicesInner | undefined
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix =
`
Answer a question as Stephen Hawking with the title below.

Title:
`

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Run first prompt
  console.info(`Prompt sending to the OpenAI API: ${basePromptPrefix}${req.body.userInput}\n`)

  try {
    const baseCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${basePromptPrefix}${req.body.userInput}`,
      temperature: 0.7,
      max_tokens: 250,
    });
    
    const basePromptOutput = baseCompletion.data.choices.pop();
  
    console.info(`Prompt output from the OpenAI API: ${basePromptOutput}`)

    res.status(200).json({ output: basePromptOutput });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
