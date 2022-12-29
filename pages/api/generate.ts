import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  OpenAIApi,
  Configuration, 
  CreateCompletionResponseChoicesInner,
} from 'openai';
import vm from 'vm';

type Data = {
  output?: any //CreateCompletionResponseChoicesInner
  code?: string
  query?: string
  error?: string
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const prompt =
  `
  Here is a graphql schema for the Uniswap subgraph built on The Graph Protocol:
  
  type Token @entity {
    # token address
    id: ID!
    # token symbol
    symbol: String!
    # token name
    name: String!
    # token decimals
    decimals: BigInt!
    # token total supply
    totalSupply: BigInt!
    # volume in token units
    volume: BigDecimal!
    # volume in derived USD
    volumeUSD: BigDecimal!
    # volume in USD even on pools with less reliable USD values
    untrackedVolumeUSD: BigDecimal!
    # fees in USD
    feesUSD: BigDecimal!
    # transactions across all pools that include this token
    txCount: BigInt!
    # number of pools containing this token
    poolCount: BigInt!
    # liquidity across all pools in token units
    totalValueLocked: BigDecimal!
    # liquidity across all pools in derived USD
    totalValueLockedUSD: BigDecimal!
    # TVL derived in USD untracked
    totalValueLockedUSDUntracked: BigDecimal!
    # derived price in ETH
    derivedETH: BigDecimal!
    # pools token is in that are white listed for USD pricing
    whitelistPools: [Pool!]!
    # derived fields
    tokenDayData: [TokenDayData!]! @derivedFrom(field: "token")
  }

  # Data accumulated and condensed into day stats for all of Uniswap
  type UniswapDayData @entity {
    # timestamp rounded to current day by dividing by 86400
    id: ID!
    # timestamp rounded to current day by dividing by 86400
    date: Int!
    # total daily volume in Uniswap derived in terms of ETH
    volumeETH: BigDecimal!
    # total daily volume in Uniswap derived in terms of USD
    volumeUSD: BigDecimal!
    # total daily volume in Uniswap derived in terms of USD untracked
    volumeUSDUntracked: BigDecimal!
    # fees in USD
    feesUSD: BigDecimal!
    # number of daily transactions
    txCount: BigInt!
    # tvl in terms of USD
    tvlUSD: BigDecimal!
  }

  Given that schema, write a Node.JS module that exports a function named run. This function should not have any parameters, and should generate a GraphQL query string for this subgraph, that answers the following question:

  "${req.body.userInput}"

  This function should use the Date object to convert dates into timestamps if necessary.
  `

  // Run first prompt
  console.info(`Prompt sending to the OpenAI API: ${prompt}\n`)

  try {
    const baseCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${prompt}`,
      temperature: 0.7,
      max_tokens: 250,
    });
    
    const basePromptOutput = baseCompletion.data.choices.pop();


    const code = basePromptOutput!.text;

    console.log(code);

    const vmModule: any = { exports: {} };

    const vmContext = vm.createContext({
      exports: vmModule.exports,
      module: vmModule
    });
    // @ts-ignore
    vmContext.constructor = null;

    const script = new vm.Script(code!);

    script.runInContext(vmContext);
  
    console.info(`Prompt output from the OpenAI API: ${basePromptOutput}`)

    const query = vmModule.exports.run();

    // const query = `{
    //   tokens(orderBy: volumeUSD, orderDirection: desc, first: 3) {
    //     id
    //     symbol
    //     name
    //     volumeUSD
    //   }
    // }`

    console.log(query)

    const graphResponse = await fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", {
      "headers": {
        "content-type": "application/json",
      },
      "body": JSON.stringify({ query }),
      "method": "POST",
    });

    const output = await graphResponse.json();

    res.status(200).json({ query, code, output });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.toString() })
  }
};

export default handler;
