const jwt = require('jsonwebtoken');

const getUser = async (token, prisma) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add expiration check for additional security
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.log('Token expired');
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      // Be explicit about what fields you're requesting for security
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountStatus: true,
        // Add any other fields you need
      }
    });

    if (!user || (user.accountStatus !== 'ACTIVE' && user.accountStatus !== 'VERIFIED')) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('JWT decode error:', error.message);
    return null;
  }
};

// Express middleware to extract token from headers
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    req.token = token;  // Store token for use in resolvers
  }

  next();
};

module.exports = { getUser, authMiddleware };