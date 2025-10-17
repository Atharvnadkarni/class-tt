let ioInstance;

function initSocket(io) {
  ioInstance = io;
}

function getSocket() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized yet!");
  }
  return ioInstance;
}

module.exports = { initSocket, getSocket };
