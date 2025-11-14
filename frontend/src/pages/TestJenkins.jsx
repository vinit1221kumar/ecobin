import { useState } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';

const TestJenkins = () => {
  const [code, setCode] = useState(`jenkins file updated 2nd time`);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F172A' }}>
      <NavigationBar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid #00B8A9',
              boxShadow: '0 0 30px rgba(0, 184, 169, 0.3)',
            }}
          >
            <h1 
              className="text-3xl font-bold mb-6 text-center"
              style={{ color: '#00B8A9' }}
            >
              Test Jenkins
            </h1>
            
            <div className="mb-6">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows="12"
                className="w-full px-4 py-3 rounded-lg focus:outline-none font-mono text-sm"
                style={{ 
                  backgroundColor: '#1E293B',
                  border: '1px solid #00B8A9',
                  color: '#E2E8F0',
                  resize: 'vertical'
                }}
                placeholder="Write your code here..."
              />
            </div>
            
            <div className="text-center">
              <Link
                to="/"
                className="inline-block px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                style={{
                  backgroundColor: '#00B8A9',
                  color: '#FFFFFF',
                  boxShadow: '0 0 20px rgba(0, 184, 169, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#009688';
                  e.target.style.boxShadow = '0 0 30px rgba(0, 184, 169, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#00B8A9';
                  e.target.style.boxShadow = '0 0 20px rgba(0, 184, 169, 0.4)';
                }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestJenkins;
