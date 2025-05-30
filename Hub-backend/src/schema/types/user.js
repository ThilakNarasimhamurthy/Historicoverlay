const { gql } = require('apollo-server-express');

module.exports = gql`
  # Scalars
  scalar DateTime
  scalar UUID
  scalar JSON

  # Enums
  enum UserRole {
    STUDENT
    UNIVERSITY
    COMPANY
    ADMIN
  }

  enum AccountStatus {
    ACTIVE
    VERIFIED
    SUSPENDED
  }

  # User Type
  type User {
    id: UUID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    accountStatus: AccountStatus!
    loginHistory: [DateTime!]
    createdAt: DateTime!
    updatedAt: DateTime!
    student: Student
    university: University
    company: Company
    admin: Admin
  }

  # Role-specific Types
  type Student {
    userId: UUID!
    graduationYear: Int!
    specialization: String!
    interests: [String!]
    university: String!
    careerGoals: [String!]!
    dateOfBirth: DateTime!
    user: User!
  }

  type University {
    userId: UUID!
    institutionName: String!
    foundationYear: Int!
    address: String!
    contactNumber: String!
    website: String
    user: User!
  }

  type Company {
    userId: UUID!
    companyName: String!
    industry: String!
    foundationYear: Int!
    address: String!
    contactNumber: String!
    website: String
    user: User!
  }

  type Admin {
    userId: UUID!
    accessLevel: String!
    adminSince: DateTime!
    lastAccess: DateTime!
    user: User!
  }

  # Input Types
  input CreateUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole!
  }

  input UpdateUserInput {
    email: String
    password: String
    firstName: String
    lastName: String
    role: UserRole
    accountStatus: AccountStatus
  }

  input CreateStudentInput {
    userId: UUID!
    graduationYear: Int!
    specialization: String!
    interests: [String!]
    careerGoals: [String!]!
    university: String!
    dateOfBirth: DateTime!
  }

  input UpdateStudentInput {
    graduationYear: Int
    specialization: [String!]
    university: String!
    careerGoals: [String!]
    dateOfBirth: DateTime
  }

  input CreateUniversityInput {
    userId: UUID!
    institutionName: String!
    foundationYear: Int!
    address: String!
    contactNumber: String!
    website: String
  }

  input UpdateUniversityInput {
    institutionName: String
    foundationYear: Int
    address: String
    contactNumber: String
    website: String
  }

  input CreateCompanyInput {
    userId: UUID!
    companyName: String!
    industry: String!
    foundationYear: Int!
    address: String!
    contactNumber: String!
    website: String
  }

  input UpdateCompanyInput {
    companyName: String
    industry: String
    foundationYear: Int
    address: String
    contactNumber: String
    website: String
  }

  input CreateAdminInput {
    userId: UUID!
    accessLevel: String!
  }

  input UpdateAdminInput {
    accessLevel: String
    lastAccess: DateTime
  }

  input CreateUserWithRoleInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    university : String
    graduationYear: Int
    specialization: String
    interests: [String!]
    careerGoals: [String!]
    dateOfBirth: DateTime
    institutionName: String
    companyName: String
    industry: String
    foundationYear: Int
    address: String
    contactNumber: String
    website: String

    accessLevel: String
  }

  # Queries
  type Query {
    me: User

    user(id: UUID!): User
    users(role: UserRole, limit: Int, offset: Int): [User!]!

    student(userId: UUID!): Student
    students(limit: Int, offset: Int): [Student!]!

    university(userId: UUID!): University
    universities(limit: Int, offset: Int): [University!]!

    company(userId: UUID!): Company
    companies(limit: Int, offset: Int): [Company!]!

    admin(userId: UUID!): Admin
    admins(limit: Int, offset: Int): [Admin!]!
  }

  # Mutations
  type Mutation {
    # User
    createUser(input: CreateUserInput!): User!
    updateUser(id: UUID!, input: UpdateUserInput!): User!
    deleteUser(id: UUID!): Boolean!

    # Student
    createStudent(input: CreateStudentInput!): Student!
    updateStudent(userId: UUID!, input: UpdateStudentInput!): Student!
    deleteStudent(userId: UUID!): Boolean!

    # University
    createUniversity(input: CreateUniversityInput!): University!
    updateUniversity(userId: UUID!, input: UpdateUniversityInput!): University!
    deleteUniversity(userId: UUID!): Boolean!

    # Company
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(userId: UUID!, input: UpdateCompanyInput!): Company!
    deleteCompany(userId: UUID!): Boolean!

    # Admin
    createAdmin(input: CreateAdminInput!): Admin!
    updateAdmin(userId: UUID!, input: UpdateAdminInput!): Admin!
    deleteAdmin(userId: UUID!): Boolean!
    createUserWithRole(input: CreateUserWithRoleInput!): User!
  }
`;
