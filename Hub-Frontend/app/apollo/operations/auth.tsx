// app/apollo/operations/auth.ts
import { gql } from '@apollo/client';
import client, { isLoggedInVar, authTokenVar, currentUserVar, User, setAuthToken, setCurrentUser } from '@/app/apollo/client';

// Define enhanced types to include role-specific fields
export type { User } from '@/app/apollo/client';

// Add these interfaces if they're not already defined in client.ts
export interface Student {
  userId: string;
  graduationYear: number;
  specialization: string;
  interests: string[];
  university: string;
  careerGoals: string[];
  dateOfBirth: string;
}

export interface University {
  userId: string;
  institutionName: string;
  foundationYear: number;
  address: string;
  contactNumber: string;
  website?: string;
}

export interface Company {
  userId: string;
  companyName: string;
  industry: string;
  foundationYear: number;
  address: string;
  contactNumber: string;
  website?: string;
}

export interface Admin {
  userId: string;
  accessLevel: string;
  adminSince: string;
  lastAccess: string;
}

// Enhanced User interface with role-specific data
export interface EnhancedUser extends User {
  accountStatus: 'ACTIVE' | 'VERIFIED' | 'SUSPENDED';
  student?: Student;
  university?: University;
  company?: Company;
  admin?: Admin;
}

// Client-side query to check login status
export const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
    currentUser @client
  }
`;

// Login mutation with role-specific fields
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user {
        id
        role
        email
        firstName
        lastName
        accountStatus
        # Role-specific fields
        student {
          userId
          graduationYear
          specialization
          interests
          university
          careerGoals
          dateOfBirth
        }
        university {
          userId
          institutionName
          foundationYear
          address
          contactNumber
          website
        }
        company {
          userId
          companyName
          industry
          foundationYear
          address
          contactNumber
          website
        }
        admin {
          userId
          accessLevel
          adminSince
          lastAccess
        }
      }
    }
  }
`;

// Get current user query
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      role
      email
      firstName
      lastName
      accountStatus
      # Role-specific fields
      student {
        userId
        graduationYear
        specialization
        interests
        university
        careerGoals
        dateOfBirth
      }
      university {
        userId
        institutionName
        foundationYear
        address
        contactNumber
        website
      }
      company {
        userId
        companyName
        industry
        foundationYear
        address
        contactNumber
        website
      }
      admin {
        userId
        accessLevel
        adminSince
        lastAccess
      }
    }
  }
`;

export interface LoginResponse {
  login: {
    token: string;
    user: EnhancedUser;
  }
}

// Helper functions with proper type annotations
export const login = (token: string, user: EnhancedUser): void => {
  setAuthToken(token);
  setCurrentUser(user);
  
  // Store complete user data including role-specific fields
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = (): void => {
  // Use the logout function from client.ts
  require('@/app/apollo/client').logout();
  
  // Clear Apollo cache on logout
  client.clearStore().catch((err: Error) => {
    console.error('Error clearing Apollo cache:', err);
  });
  
  // Ensure localStorage is cleared
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

// Helper function to get role-specific data
export const getRoleData = (user: EnhancedUser) => {
  if (!user) return null;
  
  const role = user.role.toLowerCase();
  
  switch (role) {
    case 'student':
      return user.student;
    case 'university':
      return user.university;
    case 'company':
      return user.company;
    case 'admin':
      return user.admin;
    default:
      return null;
  }
};