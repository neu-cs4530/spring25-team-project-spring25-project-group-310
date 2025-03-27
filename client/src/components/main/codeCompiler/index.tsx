import React, { useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { JSHINT } from 'jshint';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/javascript-lint';

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).JSHINT = JSHINT;

interface CodeCompilerProps {
  code: string;
  onCodeChange: (code: string) => void;
  readOnly?: boolean;
}

const CodeCompiler: React.FC<CodeCompilerProps> = ({ code, onCodeChange, readOnly = false }) => {
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleRunCode = () => {
    try {
      let capturedOutput = '';
      /* eslint-disable no-console */
      const originalConsoleLog = console.log;
      /* eslint-disable no-console */
      console.log = (...args: unknown[]): void => {
        capturedOutput += `${args.join(' ')}\n`;
      };

      // eslint-disable-next-line no-eval
      const result = eval(code);
      /* eslint-disable no-console */
      console.log = originalConsoleLog;

      const resultOutput = result !== undefined ? result.toString() : '';
      setOutput(capturedOutput + resultOutput);
      setError('');
    } catch (err: unknown) {
      setOutput('');
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <CodeMirror
        value={code}
        options={{
          mode: 'javascript',
          theme: 'material',
          lineNumbers: true,
          readOnly,
          lint: true,
        }}
        onBeforeChange={(_editor, _data, value) => onCodeChange(value)}
      />
      <button onClick={handleRunCode} style={{ marginTop: '1rem' }}>
        Run Code
      </button>
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f4f4f4' }}>
        {error ? (
          <pre style={{ color: 'red' }}>{error}</pre>
        ) : (
          <pre>{output || 'Code output will appear here.'}</pre>
        )}
      </div>
    </div>
  );
};

export default CodeCompiler;
