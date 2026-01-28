import React from 'react';
import FullApp from './components/FullApp.jsx';

console.log('🚀 LuxeMarket App loading...');

function App() {
  return (
    <React.Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', color: '#111827', marginBottom: '1rem', fontWeight: 'bold' }}>
            LuxeMarket
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.2rem' }}>Loading your premium shopping experience...</p>
          <div style={{ 
            marginTop: '2rem',
            width: '200px',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden',
            margin: '2rem auto'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#2563eb',
              borderRadius: '2px',
              animation: 'loading 2s ease-in-out infinite'
            }}></div>
          </div>
          <style>{`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      </div>
    }>
      <FullApp />
    </React.Suspense>
  );
}

export default App;