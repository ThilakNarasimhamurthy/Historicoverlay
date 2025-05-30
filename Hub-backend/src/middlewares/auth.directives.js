// apollo/directives/auth.directive.js
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const { defaultFieldResolver } = require('graphql');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');

// Auth directive for protected fields and queries/mutations
function authDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    // Handle field directives
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Get directive from field
      const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      
      if (authDirective) {
        // Get required roles if specified
        const { requires } = authDirective;
        
        // Get original resolver
        const { resolve = defaultFieldResolver } = fieldConfig;
        
        // Replace resolver with auth-checking wrapper
        fieldConfig.resolve = async function (source, args, context, info) {
          // Check if user is authenticated
          if (!context.isAuthenticated) {
            throw new AuthenticationError('You must be logged in to access this resource');
          }
          
          // If roles are required, check user role
          if (requires && requires.length > 0) {
            const userRole = context.user.role;
            const hasRequiredRole = requires.includes(userRole);
            
            if (!hasRequiredRole) {
              throw new ForbiddenError('You do not have permission to access this resource');
            }
          }
          
          // If authenticated and authorized, call original resolver
          return resolve(source, args, context, info);
        };
        
        return fieldConfig;
      }
    }
  });
}

module.exports = authDirectiveTransformer;