"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useQuery } from "@apollo/client"
import { IS_LOGGED_IN, EnhancedUser } from '@/app/apollo/operations/auth'

// Enhanced ProfileContextType to include role and authentication status
type ProfileContextType = {
  profilePic: string | null
  userName: string
  userRole: string
  isLoggedIn: boolean
  user: EnhancedUser | null
  roleData: any // The role-specific data (student, university, etc.)
  isLoading: boolean
  isInitializing: boolean // Track initial loading separately
  setProfilePic: (url: string) => void
  setUserName: (name: string) => void
  getRoleDisplayName: () => string
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  // Track client-side rendering
  const [mounted, setMounted] = useState(false)
  // Track initialization of auth state
  const [isInitializing, setIsInitializing] = useState(true)
  // Track errors for debugging
  const [initError, setInitError] = useState<Error | null>(null)
  
  // State for user profile data
  const [profileState, setProfileState] = useState({
    profilePic: null as string | null,
    userName: "",
    userRole: "",
    isLoggedIn: false,
    user: null as EnhancedUser | null,
    roleData: null as any
  })
  
  // Skip query during SSR
  const { data, loading, error } = useQuery(IS_LOGGED_IN, {
    fetchPolicy: 'cache-and-network',
    skip: !mounted,
    notifyOnNetworkStatusChange: true,
  })
  
  // Mark as mounted when on client
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Extract role-specific data from user object
  const extractRoleData = useCallback((user: EnhancedUser | null) => {
    if (!user || !user.role) return null
    
    const roleLower = user.role.toLowerCase()
    
    // Return the appropriate role data based on user role
    switch (roleLower) {
      case 'student':
        return user.student || null
      case 'university':
        return user.university || null
      case 'company':
        return user.company || null
      case 'admin':
        return user.admin || null
      default:
        return null
    }
  }, [])
  
  // Initialize state from localStorage and Apollo cache
  useEffect(() => {
    // Skip during SSR
    if (!mounted) return
    
    try {
      // Safely access localStorage (only on client)
      const storedPic = typeof window !== 'undefined' ? localStorage.getItem("profilePic") : null
      const storedName = typeof window !== 'undefined' ? localStorage.getItem("userName") : null
      
      // Get user from Apollo cache
      const user = data?.currentUser || null
      const isLoggedIn = !!user
      const userRole = user?.role || ""
      const roleData = extractRoleData(user)
      
      // Generate user name
      let displayName = ""
      if (user?.firstName && user?.lastName) {
        displayName = `${user.firstName} ${user.lastName}`
      } else if (storedName) {
        displayName = storedName
      }
      
      // Update state
      setProfileState({
        profilePic: user?.avatar || storedPic || null,
        userName: displayName,
        userRole,
        isLoggedIn,
        user,
        roleData
      })
      
    } catch (err) {
      // Log error but don't crash
      console.error("Error initializing profile:", err)
      setInitError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      // Mark initialization as complete
      setIsInitializing(false)
    }
  }, [mounted, data, extractRoleData])
  
  // Safe setter for profile picture
  const setProfilePic = useCallback((url: string) => {
    if (!mounted) return // Skip during SSR
    
    setProfileState(prev => ({ ...prev, profilePic: url }))
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("profilePic", url)
      }
    } catch (err) {
      console.error("Error saving profile pic:", err)
    }
  }, [mounted])
  
  // Safe setter for user name
  const setUserName = useCallback((name: string) => {
    if (!mounted) return // Skip during SSR
    
    setProfileState(prev => ({ ...prev, userName: name }))
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("userName", name)
      }
    } catch (err) {
      console.error("Error saving user name:", err)
    }
  }, [mounted])
  
  // Get formatted role name
  const getRoleDisplayName = useCallback(() => {
    const role = profileState.userRole?.toLowerCase() || ""
    
    switch (role) {
      case 'student':
        return "Student"
      case 'university':
        return "University"
      case 'company':
        return "Company"
      case 'admin':
        return "Administrator"
      default:
        return "User"
    }
  }, [profileState.userRole])
  
  // The actual loading state combines multiple factors
  const isLoading = (!mounted || isInitializing || loading)
  
  // Dev-mode logging for auth issues
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (error) {
        console.warn("Auth query error:", error)
      }
      if (initError) {
        console.warn("Profile initialization error:", initError)
      }
    }
  }, [error, initError])
  
  // Context value
  const contextValue = {
    ...profileState,
    isLoading,
    isInitializing,
    setProfilePic,
    setUserName,
    getRoleDisplayName
  }
  
  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  )
}

// Custom hook to use the profile context
export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider")
  }
  return context
}