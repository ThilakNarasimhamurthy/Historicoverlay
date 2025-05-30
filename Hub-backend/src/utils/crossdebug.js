const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Post = require('../models/Post');

async function logUserDetails(userId) {
  console.log(`\n======= CROSS-DB USER VERIFICATION =======`);
  console.log(`Checking user ID: "${userId}" (type: ${typeof userId})`);
  
  try {
    // Try exact match
    const exactUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (exactUser) {
      console.log(`✅ FOUND USER with exact ID match: ${JSON.stringify({
        id: exactUser.id,
        name: `${exactUser.firstName} ${exactUser.lastName}`,
        email: exactUser.email
      })}`);
      return true;
    }
    
    console.log(`❌ No exact match found for ID: "${userId}"`);
    
    // Try with toString
    const stringUser = await prisma.user.findUnique({
      where: { id: userId.toString() }
    });
    
    if (stringUser) {
      console.log(`✅ FOUND USER with toString: ${JSON.stringify({
        id: stringUser.id,
        name: `${stringUser.firstName} ${stringUser.lastName}`,
        email: stringUser.email
      })}`);
      return true;
    }
    
    // Try finding any users
    const anyUsers = await prisma.user.findMany({ take: 3 });
    console.log(`❓ Sample users in database: ${JSON.stringify(anyUsers.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`
    })))}`);
    
    return false;
  } catch (error) {
    console.error(`❌ Error checking user: ${error.message}`);
    return false;
  }
}

module.exports = { logUserDetails };