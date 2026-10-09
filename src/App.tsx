import React from 'react';

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0B3D2E',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <img 
        src="/logo.jpg" 
        alt="Smart Kisan Bharat Logo" 
        style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '20px' }} 
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>स्मार्ट किसान भारत</h1>
      <p style={{ color: '#A7F3D0' }}>Digital Agricultural Marketplace</p>
    </div>
  );
}
