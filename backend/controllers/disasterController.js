






const supabase = require('../supabaseClient');
const { extractAndGeocode } = require('../services/geocodingService');

// ✅ Get Disaster by ID (Dummy Response)
const getDisasterById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('disasters')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Disaster not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ Create Disaster
const createDisaster = async (req, res, io) => {
  try {
    const { title, description, tags } = req.body;
    const user = req.user;

    const locationData = await extractAndGeocode(description);
    if (!locationData) {
      return res.status(400).json({ error: 'Location extraction failed' });
    }

    const disaster = {
      title,
      description,
      tags,
      location_name: locationData.locationName,
      location: `POINT(${locationData.lng} ${locationData.lat})`,
      owner_id: user.id,
      audit_trail: [{
        action: 'create',
        user_id: user.id,
        timestamp: new Date().toISOString()
      }]
    };

    const { data, error } = await supabase
      .from('disasters')
      .insert([disaster])
      .select();

    if (error) throw error;

    if (io) {
      io.emit('disaster_updated', { action: 'create', data: data[0] });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Disasters (optional filter)
const getDisasters = async (req, res) => {
  try {
    const { tag } = req.query;
    let query = supabase.from('disasters').select('*');

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Disaster
const updateDisaster = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { title, description, tags, location } = req.body;
    const user = req.user;

    const { data: existingData, error: fetchError } = await supabase
      .from('disasters')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({ error: 'Disaster not found' });
    }

    const existing = existingData;

    const updates = {
      title: title || existing.title,
      description: description || existing.description,
      tags: tags || existing.tags,
      location_name: location?.location_name || existing.location_name,
      location: location?.geometry || existing.location
    };

    const changes = {};
    for (const key in updates) {
      if (updates[key] !== existing[key]) {
        changes[key] = [existing[key], updates[key]];
      }
    }

    const audit_entry = {
      action: 'update',
      user_id: user.id,
      timestamp: new Date().toISOString(),
      changes
    };

    const updatedAuditTrail = Array.isArray(existing.audit_trail)
      ? [...existing.audit_trail, audit_entry]
      : [audit_entry];

    const { data: updated, error: updateError } = await supabase
      .from('disasters')
      .update({ ...updates, audit_trail: updatedAuditTrail })
      .eq('id', id)
      .select();

    if (updateError) throw updateError;

    if (io) {
      io.emit('disaster_updated', { action: 'update', data: updated[0] });
    }

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Disaster
const deleteDisaster = async (req, res, io) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const { data, error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (io) {
      io.emit('disaster_updated', { action: 'delete', data: { id } });
    }

    res.json({ message: 'Disaster deleted', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Export All
module.exports = {
  getDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster
};
