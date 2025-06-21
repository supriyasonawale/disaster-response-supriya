module.exports = function(socketService) {
  return (req, res, next) => {
    req.socketService = socketService;
    next();
  };
};
