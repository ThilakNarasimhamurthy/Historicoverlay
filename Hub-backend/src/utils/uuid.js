const { v4: uuidv4 } = require('uuid');

/**
 * Generate a new UUID
 * @returns {string} - A new UUID string
 */
function generateUUID() {
  return uuidv4();
}

module.exports = {
  generateUUID
};