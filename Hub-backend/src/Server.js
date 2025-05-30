require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { PrismaClient } = require('@prisma/client');
const { connectMongo } = require('./config/mongo');
const { getUser } = require('./middlewares/auth');
const typeDefs = require('./schema/schema');
const resolvers = require('./resolvers/resolvers');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS - Uncomment this!
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL - change if needed
  credentials: true
}));

// Connect to MongoDB
connectMongo();

// Initialize Prisma Client
const prisma = new PrismaClient();

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      const user = await getUser(token.replace('Bearer ', ''), prisma);

      return {
        user,
        prisma,
        req
      };
    }
  });

  await server.start();

  app.use(express.json());

  // Apply expressMiddleware with CORS options
  app.use('/graphql', cors({
    origin: 'http://localhost:3000', // Your frontend URL - change if needed
    credentials: true
  }), expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = await getUser(token, prisma);
      return { user, prisma, req };
    }
  }));

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🚀 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch(err => {
  console.error('Error starting server:', err);
});