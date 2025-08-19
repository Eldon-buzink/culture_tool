'use client';
import { useState, useEffect } from 'react';

export default function TestAssessmentPage() {
  const [status, setStatus] = useState('Loading...');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        setStatus('Testing API...');
        
        // Test questions API
        const questionsResponse = await fetch('/api/get-ocean-questions');
        const questionsData = await questionsResponse.json();
        
        setStatus(`Questions API: ${questionsData.questions?.length || 0} questions`);
        setData(questionsData);
        
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Test error:', error);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Assessment API Test</h1>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
