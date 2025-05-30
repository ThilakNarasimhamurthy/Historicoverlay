const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const UserActivityFeed = require('../models/UserActivity');

const userResolvers = {
  User: {
    student: async (parent) => {
      return await prisma.student.findUnique({ where: { userId },include: {user: true, },
      });
    },
    university: async (parent) => {
      return await prisma.university.findUnique({ where: { userId },include: {user: true, }, });
    },
    company: async (parent) => {
      return await prisma.company.findUnique({ where: { userId },include: {user: true, }, });
    },
    admin: async (parent) => {
      return await prisma.admin.findUnique({ where: { userId: parent.id } });
    },
  },

  Mutation: {
    createUserWithRole: async (_, { input }) => {
      const {
        email,
        password,
        firstName,
        lastName,
        role,
        graduationYear,
        university,
        specialization,
        interests,
        careerGoals,
        dateOfBirth,
        institutionName,
        companyName,
        foundationYear,
        address,
        contactNumber,
        industry,
        website,
        accessLevel,
      } = input;

      const userId = uuidv4();
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (!validator.isEmail(email)) throw new Error('Invalid email format');
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              id: userId,
              firstName,
              lastName,
              email,
              password: hashedPassword,
              role,
              accountStatus: 'ACTIVE',
              loginHistory: [],
            },
          });

          await tx.subscription.create({
            data: {
              userId,
              planType: 'FREE',
              paymentStatus: 'PENDING',
              lastRenewalDate: new Date(),
              nextRenewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            },
          });

          switch (role) {
            case 'STUDENT':
              if (!graduationYear || !specialization || !careerGoals || !dateOfBirth) {
                throw new Error('Missing student fields');
              }
              await tx.student.create({
                data: {
                  userId,
                  graduationYear,
                  specialization,
                  interests,
                  university,
                  careerGoals,
                  dateOfBirth: new Date(dateOfBirth),
                },
              });
              break;

            case 'UNIVERSITY':
              if (!institutionName || !foundationYear || !address || !contactNumber) {
                throw new Error('Missing university fields');
              }
              await tx.university.create({
                data: {
                  userId,
                  institutionName,
                  foundationYear,
                  address,
                  contactNumber,
                  website,
                },
              });
              break;

            case 'COMPANY':
              if (!companyName || !foundationYear || !address || !contactNumber) {
                throw new Error('Missing company fields');
              }
              await tx.company.create({
                data: {
                  userId,
                  companyName,
                  industry: 'General',
                  foundationYear,
                  address,
                  contactNumber,
                  website,
                },
              });
              break;

            case 'ADMIN':
              if (!accessLevel) {
                throw new Error('Missing admin access level');
              }
              await tx.admin.create({
                data: {
                  userId,
                  accessLevel,
                  adminSince: new Date(),
                  lastAccess: new Date(),
                },
              });
              break;

            default:
              throw new Error('Unsupported role');
          }

          return newUser;
        });

        const activity = {
          activity_id: uuidv4(),
          activity_type: 'User Created',
          related_entity_id: user.id,
          related_entity_type: 'User',
          metadata: {
            firstName,
            lastName,
            email,
            timestamp: new Date(),
            _id: new mongoose.Types.ObjectId(),
          },
        };

        const userActivityFeed = new UserActivityFeed({
          _id: user.id,
          activities: [activity],
        });

        await userActivityFeed.save({ session });
        await session.commitTransaction();
        session.endSession();

        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION || '1d' }
        );

        // Fetch complete user data with associated role data
        const completeUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            student: true,
            university: true,
            company: true,
            admin: true,
          },
        });

        return completeUser;

      } catch (err) {
        await session.abortTransaction();
        session.endSession();

        await prisma.subscription.deleteMany({ where: { userId } }).catch(() => {});
        await prisma.user.delete({ where: { id: userId } }).catch(() => {});
        throw new Error(`Failed to create user: ${err.message}`);
      }
    },
  },
};

module.exports = userResolvers;
