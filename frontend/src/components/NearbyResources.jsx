import React, { useEffect, useState } from 'react';

const NearbyResources = ({ lat, lon, disasterId }) => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      if (!lat || !lon) return;
      try {
        const res = await fetch(`http://localhost:8080/api/disasters/${disasterId}/resources?lat=${lat}&lon=${lon}`);
        const json = await res.json();
        setResources(json.data || []);
      } catch (err) {
        console.error('Error fetching nearby resources:', err);
      }
    };

    fetchResources();
  }, [lat, lon, disasterId]);

  return (
    <div className="mt-3">
      <h6>🏥 Nearby Resources</h6>
      {resources.length === 0 ? (
        <p className="text-muted">No resources found nearby.</p>
      ) : (
        <ul className="list-group">
          {resources.map((r) => (
            <li key={r.id} className="list-group-item">
              <strong>{r.name}</strong> — {r.type}<br />
              <small>{r.location_name}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NearbyResources;
