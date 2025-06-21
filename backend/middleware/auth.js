//Simple mock authentication middleware
module.exports = (req, res, next) => {
  // Hardcoded users for testing
  const users = {
    netrunnerX: { id: 'netrunnerX', role: 'admin' },
    reliefAdmin: { id: 'reliefAdmin', role: 'admin' },
    contributor1: { id: 'contributor1', role: 'contributor' }
  };

  // Simulate authentication by setting user based on header
  const userId = req.headers['x-user-id'] || 'netrunnerX';
  req.user = users[userId] || users.netrunnerX;
  
  next();
};