module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return {
    emitDisasterUpdate: (disaster) => {
      io.emit('disaster_updated', disaster);
    },
    emitSocialUpdate: (disasterId, posts) => {
      io.emit('social_media_updated', { disasterId, posts });
    }
  };
};