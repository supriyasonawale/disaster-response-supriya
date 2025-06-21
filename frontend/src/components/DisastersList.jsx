import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:8080'); // adjust for deployment

const DisastersList = () => {
  const [disasters, setDisasters] = useState([]);
  const [resources, setResources] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
       const res = await fetch(`${process.env.REACT_APP_API_URL}/api/disasters`);
        const json = await res.json();
        const allDisasters = Array.isArray(json.data) ? json.data : json;
        setDisasters(allDisasters);
      } catch (err) {
        console.error('Error fetching disasters:', err);
      }
    };

    fetchDisasters();

    socket.on('disaster_created', (newDisaster) => {
      toast.info(`🆕 New disaster reported: ${newDisaster.title}`);
      setDisasters(prev => [newDisaster, ...prev]);
    });

    return () => {
      socket.off('disaster_created');
    };
  }, []);

  // ✅ Utility to extract lat/lon from POINT string
  const parsePoint = (locationStr) => {
    if (!locationStr) return [null, null];
    const match = locationStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (!match) return [null, null];
    return [parseFloat(match[2]), parseFloat(match[1])]; // [lat, lon]
  };

  const toggleResources = async (disaster) => {
    const id = disaster.id;
    const [lat, lon] = parsePoint(disaster.location);

    if (!lat || !lon) {
      toast.error("❌ Missing lat/lon for this disaster");
      return;
    }

    if (!expanded[id]) {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/disasters/${id}/resources?lat=${lat}&lon=${lon}`);

        const json = await res.json();
        setResources(prev => ({ ...prev, [id]: json.data || [] }));
      } catch (err) {
        console.error('Error fetching resources:', err);
        toast.error('Failed to load resources');
      }
    }

    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mt-5">
      <h3>📋 All Disasters ({disasters.length})</h3>
      <ToastContainer position="top-right" autoClose={3000} />

      {disasters.length === 0 ? (
        <p className="text-muted">No disasters reported yet.</p>
      ) : (
        <ul className="list-group">
          {disasters.map((d) => {
            const [lat, lon] = parsePoint(d.location); // 👈 Decode lat/lon from POINT

            return (
              <li key={d.id} className="list-group-item">
                {d.image_url && (
  <img 
    src={d.image_url} 
    alt={d.title} 
    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover' }} 
    className="mb-3 rounded"
  />
)}

                <h5>{d.title}</h5>
                <p>{d.description}</p>
                <p><strong>📍 Location:</strong> {d.location_name}</p>
                {lat && lon && (
                  <p><strong>🌐 Coordinates:</strong> {lat}, {lon}</p>
                )}
                <p><strong>🧑 Owner:</strong> {d.owner_id}</p>
                <p><strong>🕒 Created At:</strong> {new Date(d.created_at).toLocaleString()}</p>

                <div className="mt-2">
                  {d.tags?.map((tag, index) => (
                    <span key={index} className="badge bg-secondary me-1">{tag}</span>
                  ))}
                </div>

                <button onClick={() => toggleResources(d)} className="btn btn-sm btn-outline-primary mt-2">
                  {expanded[d.id] ? 'Hide' : 'View'} Nearby Resources
                </button>

                {expanded[d.id] && (
                  <ul className="mt-3 list-group">
                    {(resources[d.id] || []).length > 0 ? (
                      resources[d.id].map((r, i) => (
                        <li key={i} className="list-group-item">
                          🏷️ <strong>{r.name}</strong> — {r.location_name} ({r.type})
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-muted">No nearby resources found.</li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DisastersList;
