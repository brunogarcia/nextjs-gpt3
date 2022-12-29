import { ChangeEvent, useState } from 'react';
import Head from 'next/head'

export default function Home() {
  const [userInput, setUserInput] = useState('What are the top 3 tokens sorted by USD volume?');
  const [apiOutput, setApiOutput] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const callGenerateEndpoint = async () => {
    setApiOutput('');
    setIsGenerating(true);
    
    try {
      console.log("Calling OpenAI...")
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput }),
      });
    
      const data = await response.json();
    
      setApiOutput(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsGenerating(false);
    }
  }

  const onUserChangedText = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(event.target.value);
  };

  return (
    <div className="root">
      <Head>
        <title>Uniswap Data</title>
        <meta name="description" content="AI writing assistant w/ GPT-3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Uniswap Data</h1>
          </div>

          <div className="header-subtitle">
            <h2>Enter a query about Uniswap's data:</h2>
          </div>
        </div>

        <div className="prompt-container">
          <textarea
            className="prompt-box"
            placeholder="eg: Explain about the Sun radiation"
            value={userInput}
            onChange={onUserChangedText}
          />

          <div className="prompt-buttons">
            <a
              className={isGenerating ? 'generate-button loading' : 'generate-button'}
              onClick={callGenerateEndpoint}
            >
              <div className="generate">
                {isGenerating ? <span className="loader"></span> : <p>Generate</p>}
              </div>
            </a>
          </div>

          {apiOutput && (
            <div className="output">
              <div className="output-header-container">
                <div className="output-header">
                  <h3>Answer 👇🏼</h3>
                </div>
              </div>
              <pre className="output-content">
                {'Code:\n'}
                {apiOutput.code}
                {'\nQuery:\n'}
                {apiOutput.query}
                {'\n\nQuery:\n'}
                {JSON.stringify(apiOutput.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
