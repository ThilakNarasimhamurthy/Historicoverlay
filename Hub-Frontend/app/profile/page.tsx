"use client"

import React, { JSX, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardShell } from "@/components/dashboard-shell"
import { useProfile } from "@/components/hooks/useProfile"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define TypeScript interfaces for better type safety
interface UserFormData {
  // Common fields for all roles
  firstName: string;
  lastName: string;
  email: string;
  accountStatus: string;
  
  // Student specific fields
  graduationYear: number;
  specialization: string;
  university: string;
  interests: string[];
  careerGoals: string[];
  dateOfBirth: string;
  
  // University specific fields
  institutionName: string;
  foundationYear: number;
  address: string;
  contactNumber: string;
  website: string;
  
  // Company specific fields
  companyName: string;
  industry: string;
  
  // Admin specific fields
  accessLevel: string;
  adminSince: string;
  lastAccess: string;
}

// Define the ProfilePage component as a React functional component
function ProfilePage(): JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { 
    profilePic, 
    setProfilePic, 
    userName, 
    setUserName, 
    userRole, 
    isLoggedIn,
    isLoading,
    user
  } = useProfile()

  // Define form data structure that will change based on role
  const [userData, setUserData] = useState<UserFormData>({
    // Common fields for all roles
    firstName: "",
    lastName: "",
    email: "",
    accountStatus: "ACTIVE",
    
    // Student specific fields
    graduationYear: 2025,
    specialization: "",
    university: "",
    interests: [],
    careerGoals: [],
    dateOfBirth: "",
    
    // University specific fields
    institutionName: "",
    foundationYear: 2000,
    address: "",
    contactNumber: "",
    website: "",
    
    // Company specific fields
    companyName: "",
    industry: "",
    
    // Admin specific fields
    accessLevel: "",
    adminSince: "",
    lastAccess: ""
  })

  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    // Load data from profile context when available
    if (profilePic) setPreview(profilePic)
    
    // Initialize user data from Apollo cache when available
    if (user) {
      // Common fields
      const baseUserData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        accountStatus: user.accountStatus || "ACTIVE"
      }
      
      // Role-specific fields
      let roleSpecificData = {}
      
      switch(userRole?.toLowerCase()) {
        case 'student':
          if (user.student) {
            roleSpecificData = {
              graduationYear: user.student.graduationYear || 2025,
              specialization: user.student.specialization || "",
              university: user.student.university || "",
              interests: user.student.interests || [],
              careerGoals: user.student.careerGoals || [],
              dateOfBirth: user.student.dateOfBirth ? new Date(user.student.dateOfBirth).toISOString().split('T')[0] : ""
            }
          }
          break
          
        case 'university':
          if (user.university) {
            roleSpecificData = {
              institutionName: user.university.institutionName || "",
              foundationYear: user.university.foundationYear || 2000,
              address: user.university.address || "",
              contactNumber: user.university.contactNumber || "",
              website: user.university.website || ""
            }
          }
          break
          
        case 'company':
          if (user.company) {
            roleSpecificData = {
              companyName: user.company.companyName || "",
              industry: user.company.industry || "",
              foundationYear: user.company.foundationYear || 2000,
              address: user.company.address || "",
              contactNumber: user.company.contactNumber || "",
              website: user.company.website || ""
            }
          }
          break
          
        case 'admin':
          if (user.admin) {
            roleSpecificData = {
              accessLevel: user.admin.accessLevel || "",
              adminSince: user.admin.adminSince ? new Date(user.admin.adminSince).toLocaleString() : "",
              lastAccess: user.admin.lastAccess ? new Date(user.admin.lastAccess).toLocaleString() : ""
            }
          }
          break
      }
      
      // Update state with all the data
      setUserData({
        ...userData,
        ...baseUserData,
        ...roleSpecificData
      })
      
      // Update the name in the profile context
      setUserName(`${baseUserData.firstName} ${baseUserData.lastName}`)
    }
  }, [profilePic, userName, user, userRole, setUserName])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      setProfilePic(url)
    }
  }

  const handleChange = (field: string, value: string | number | string[]): void => {
    setUserData(prev => ({ ...prev, [field]: value }))
    
    // If first or last name changes, update the userName in the profile context
    if (field === "firstName" || field === "lastName") {
      const firstName = field === "firstName" ? value as string : userData.firstName
      const lastName = field === "lastName" ? value as string : userData.lastName
      setUserName(`${firstName} ${lastName}`)
    }
  }

  const handleInterestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const interestsArray = e.target.value.split(',').map((item: string) => item.trim()).filter((item: string) => item)
    handleChange('interests', interestsArray)
  }

  const handleCareerGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const goalsArray = e.target.value.split(',').map((item: string) => item.trim()).filter((item: string) => item)
    handleChange('careerGoals', goalsArray)
  }

  const handleSave = (): void => {
    // Here you would normally submit the data to your backend
    // For now, we'll just toggle editing mode
    setIsEditing(false)
    
    // In a real implementation, you'd update the Apollo cache or send a mutation
    // updateUserProfile(userData)
  }

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardShell>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Profile</h2>
          </div>
          <div className="bg-white dark:bg-gray-900 border rounded-lg shadow p-6 space-y-6">
            <p className="text-center py-8">Loading profile data...</p>
          </div>
        </DashboardShell>
      </DashboardLayout>
    )
  }

  // Render different profile sections based on role
  const renderRoleSpecificSections = (): JSX.Element | null => {
    switch(userRole?.toLowerCase()) {
      case 'student':
        return (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>University</Label>
                    <Input 
                      value={userData.university} 
                      readOnly={!isEditing}
                      onChange={(e) => handleChange("university", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Graduation Year</Label>
                    <Input 
                      type="number" 
                      value={userData.graduationYear} 
                      readOnly={!isEditing}
                      onChange={(e) => handleChange("graduationYear", parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Specialization</Label>
                    <Input 
                      value={userData.specialization} 
                      readOnly={!isEditing}
                      onChange={(e) => handleChange("specialization", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Career Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Interests (comma-separated)</Label>
                  <Textarea 
                    value={userData.interests.join(", ")} 
                    readOnly={!isEditing}
                    onChange={handleInterestsChange}
                    className="h-24"
                  />
                  {!isEditing && userData.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.interests.map((interest: string, index: number) => (
                        <Badge key={index} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Career Goals (comma-separated)</Label>
                  <Textarea 
                    value={userData.careerGoals.join(", ")} 
                    readOnly={!isEditing}
                    onChange={handleCareerGoalsChange}
                    className="h-24"
                  />
                  {!isEditing && userData.careerGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.careerGoals.map((goal: string, index: number) => (
                        <Badge key={index} variant="secondary">{goal}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )
        
      case 'university':
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>University Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Institution Name</Label>
                  <Input 
                    value={userData.institutionName} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("institutionName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Foundation Year</Label>
                  <Input 
                    type="number" 
                    value={userData.foundationYear} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("foundationYear", parseInt(e.target.value))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Input 
                    value={userData.address} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input 
                    value={userData.contactNumber} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("contactNumber", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input 
                    value={userData.website} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
        
      case 'company':
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input 
                    value={userData.companyName} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input 
                    value={userData.industry} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("industry", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Foundation Year</Label>
                  <Input 
                    type="number" 
                    value={userData.foundationYear} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("foundationYear", parseInt(e.target.value))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Input 
                    value={userData.address} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input 
                    value={userData.contactNumber} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("contactNumber", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input 
                    value={userData.website} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
        
      case 'admin':
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Access Level</Label>
                  <Input 
                    value={userData.accessLevel} 
                    readOnly={!isEditing}
                    onChange={(e) => handleChange("accessLevel", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Admin Since</Label>
                  <Input 
                    value={userData.adminSince} 
                    readOnly={true}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Last Access</Label>
                  <Input 
                    value={userData.lastAccess} 
                    readOnly={true}
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
        
      default:
        return null
    }
  }

  const getRoleTitle = (): string => {
    switch(userRole?.toLowerCase()) {
      case 'student': return "Student Profile"
      case 'university': return "University Profile"
      case 'company': return "Company Profile"
      case 'admin': return "Admin Profile"
      default: return "User Profile"
    }
  }

  return (
    <ProtectedRoute allowedRoles={['student', 'university', 'company', 'admin']}>
      <DashboardLayout>
        <DashboardShell>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">{getRoleTitle()}</h2>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Basic Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={preview || ""}
                      alt={userData.firstName}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = ""
                      }}
                    />
                    <AvatarFallback className="bg-blue-100 text-gray-700 font-medium text-xl">
                      {userData.firstName && userData.lastName
                        ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="w-full max-w-xs">
                      <Label className="text-sm block mb-1">Upload Photo</Label>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={!isEditing} 
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={userData.firstName}
                      readOnly={!isEditing}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={userData.lastName}
                      readOnly={!isEditing}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={userData.email}
                      readOnly={!isEditing}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific content */}
          {renderRoleSpecificSections()}
          
        </DashboardShell>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// Make sure to export the component as default
export default ProfilePage