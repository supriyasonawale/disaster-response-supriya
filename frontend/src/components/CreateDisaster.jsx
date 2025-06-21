import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CreateDisaster = () => {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // ✅ NEW FIELD

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !locationName || !lat || !lon) {
      toast.error('❌ Please fill in all required fields.');
      return;
    }

    const body = {
      title,
      location_name: locationName,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      description,
      tags: tags.split(',').map(t => t.trim()),
      image_url: imageUrl, // ✅ INCLUDE IMAGE URL
      owner_id: 'netrunnerX' // or current user ID
    };

    try {
      const res = await fetch('http://localhost:8080/api/disasters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const json = await res.json();

      if (json.success) {
        toast.success('✅ Disaster created!');
        setTitle('');
        setLocationName('');
        setLat('');
        setLon('');
        setDescription('');
        setTags('');
        setImageUrl(''); // clear field
      } else {
        toast.error('❌ Failed to create disaster.');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Something went wrong.');
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h4 className="card-title">🌪️ Create Disaster</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">Disaster Title</label>
            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="mb-2">
            <label className="form-label">Location Description</label>
            <input className="form-control" value={locationName} onChange={e => setLocationName(e.target.value)} required />
          </div>

          <div className="mb-2 d-flex gap-2">
            <div className="flex-fill">
              <label className="form-label">Latitude</label>
              <input type="number" step="any" className="form-control" value={lat} onChange={e => setLat(e.target.value)} required />
            </div>
            <div className="flex-fill">
              <label className="form-label">Longitude</label>
              <input type="number" step="any" className="form-control" value={lon} onChange={e => setLon(e.target.value)} required />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="mb-2">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-control" value={tags} onChange={e => setTags(e.target.value)} />
          </div>

          <div className="mb-2">
            <label className="form-label">Image URL (optional)</label>
            <input className="form-control" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>
<div className="mb-3">
  <label htmlFor="imageUrl" className="form-label">Image URL (optional)</label>
  <input
    type="text"
    className="form-control"
    id="imageUrl"
    placeholder="https://example.com/image.jpg"
    value={imageUrl}
    onChange={(e) => setImageUrl(e.target.value)}
  />
</div>

          <button type="submit" className="btn btn-success">Report Disaster</button>
        </form>
      </div>
    </div>
  );
};

export default CreateDisaster;
