import { ChangeEvent, useState } from 'react';
import Head from 'next/head'

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [apiOutput, setApiOutput] = useState('')
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
      const { output } = data;
      console.log("OpenAI replied...", output.text)
    
      setApiOutput(`${output.text}`);
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
        <title>Ask anything to Stephen Hawking</title>
        <meta name="description" content="AI writing assistant w/ GPT-3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>AI Stephen Hawking</h1>
          </div>

          <div className="header-subtitle">
            <h2>I will give you my opinion about any astronomy subject</h2>
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
              <div className="output-content">
                <p>{apiOutput}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
