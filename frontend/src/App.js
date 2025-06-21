/*import React, { useState, useEffect } from 'react';
import './App.css';
import { io } from 'socket.io-client';

function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Setup WebSocket on mount
  useEffect(() => {
    const socket = io('http://localhost:8080');

    socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    socket.on('disaster_updated', (payload) => {
      console.log('🔄 Real-time update received:', payload);
      fetchDisasters();
    });

    return () => socket.disconnect();
  }, []);

  // Fetch disasters from backend
  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/disasters');
      const data = await res.json();
      setDisasters(data);
    } catch (err) {
      console.error('Error fetching disasters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('⏳ Creating disaster...');
    try {
      const response = await fetch('http://localhost:8080/disasters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(',').map(tag => tag.trim())
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Disaster created: ${data.title}`);
        setTitle('');
        setDescription('');
        setTags('');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`❌ Network error: ${err.message}`);
    }
  };

  return (
    <div className="App" style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>🌪️ Create Disaster</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label><strong>Disaster Title</strong></label><br />
          <input
            type="text"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <br />
        <div>
          <label><strong>Location Description</strong></label><br />
          <input
            type="text"
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <br />
        <div>
          <label><strong>Tags (comma-separated)</strong></label><br />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <br />
        <button type="submit" style={{ padding: '10px 20px' }}>Create Disaster</button>
      </form>

      <br />
      {message && <p>{message}</p>}

      <hr />
      <h3>📋 All Disasters</h3>
      {loading ? (
        <p>Loading disasters...</p>
      ) : disasters.length === 0 ? (
        <p>No disasters reported yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {disasters.map((disaster) => (
            <li key={disaster.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
              <h4>{disaster.title}</h4>
              <p><strong>Description:</strong> {disaster.description}</p>
              <p><strong>Location:</strong> {disaster.location_name}</p>
              <p><strong>Tags:</strong> {disaster.tags?.join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;*/



// frontend/src/App.js
import React from 'react';
import CreateDisaster from './components/CreateDisaster';
import DisastersList from './components/DisastersList';
import './App.css';

function App() {
  return (
    <div className="container py-4">
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold">🌪️ Disaster Response Coordination Platform</h1>
        <p className="lead">Aggregate real-time data to aid disaster management</p>
      </header>
      
      <main>
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <CreateDisaster />
            <DisastersList />
          </div>
        </div>
      </main>
      
      <footer className="mt-5 text-center text-muted">
        <p>Disaster Response Platform &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;