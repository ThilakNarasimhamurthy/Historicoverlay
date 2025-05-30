// /graphql/schema.js

const { gql } = require('apollo-server-express');
const userTypeDefs = require('./types/user');
const postTypeDefs = require('./types/post');
const subscriptionTypeDefs = require('./types/subscription');
const userActivityTypeDefs = require('./types/useractivity');
// const notificationTypeDefs = require('./types/notification');
const authTypeDefs = require('./types/auth');
const savedPostTypeDefs = require('./types/savedpost');
const s3uploadTypeDefs = require('./types/s3Upload');
const eventTypeDefs = require('./types/events');

const typeDefs = gql`
  ${userTypeDefs}
   ${postTypeDefs}
   ${subscriptionTypeDefs}
   ${userActivityTypeDefs}
   ${authTypeDefs}
   ${savedPostTypeDefs}
    ${s3uploadTypeDefs}
    ${eventTypeDefs}
`;

module.exports = typeDefs;
