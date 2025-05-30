// const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authResolvers = {
  Mutation: {
    //  Send OTP using Twilio
    // sendOtp: async (_, { phone }) => {
    //   await twilio.verify
    //     .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    //     .verifications.create({ to: phone, channel: 'sms' });
    //   return true;
    // },

    // // Verify OTP
    // verifyOtp: async (_, { phone, code }) => {
    //   const result = await twilio.verify
    //     .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    //     .verificationChecks.create({ to: phone, code });
    //   return result.status === 'approved';
    // }

    // Email-password login with JWT
    login: async (_, { input }, { prisma }) => {
      const { email, password } = input;
    
      // Find user with role-specific relations included
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          student: true,
          university: true,
          company: true,
          admin: true
        }
      });
    
      if (!user || (user.accountStatus !== 'ACTIVE' && user.accountStatus !== 'VERIFIED')) {
        throw new Error('Invalid email or password');
      }
    
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error('Invalid email or password');
      }
    
      // Update login history
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginHistory: {
            push: new Date()
          }
        }
      });
    
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '3d' }
      );
    
      // Get role-specific data
      let roleData = null;
      switch(user.role) {
        case 'STUDENT':
          roleData = user.student;
          break;
        case 'UNIVERSITY':
          roleData = user.university;
          break;
        case 'COMPANY':
          roleData = user.company;
          break;
        case 'ADMIN':
          roleData = user.admin;
          break;
      }
    
      // Create a sanitized user object with role-specific data included
      const sanitizedUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        accountStatus: user.accountStatus,
        // Include the role-specific data under a property named after the role
        [user.role.toLowerCase()]: roleData
      };
    
      return {
        token,
        user: sanitizedUser
      };
    },

    // Logout
    logout: async (_, __, { user, res }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (res && res.clearCookie) {
        res.clearCookie('auth_token', { path: '/' });
      }

      return true;
    }
  },

  Query: {
    // Check if logged in
    checkLoggedIn: (_, __, { user }) => {
      return { isLoggedIn: !!user };
    },
    
    // Add this resolver to get the current user with role-specific data
    me: async (_, __, { user, prisma }) => {
      if (!user) return null;
      
      // Fetch the complete user with role-specific data
      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          student: true,
          university: true,
          company: true,
          admin: true
        }
      });
      
      if (!userData) return null;
      
      // Format the response similarly to login
      return {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        accountStatus: userData.accountStatus,
        [userData.role.toLowerCase()]: userData[userData.role.toLowerCase()]
      };
    }
  }
};

module.exports = authResolvers;
