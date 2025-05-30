"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, ArrowLeft, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Define user role type
type UserRole = "STUDENT" | "UNIVERSITY" | "COMPANY"

// GraphQL client
import { gql, useMutation, ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Create Apollo Client instance
const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Replace with your GraphQL server URL
  cache: new InMemoryCache(),
});

// Define the GraphQL mutation based on backend structure
const CREATE_USER_MUTATION = gql`
  mutation CreateUserWithRole($input: CreateUserWithRoleInput!) {
    createUserWithRole(input: $input) {
      id
      email
      role
      firstName
      lastName
      accountStatus
      student {
        userId
        university
        graduationYear
        specialization
        interests
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
    }
  }
`;

export function OnboardingSteps() {
  const [step, setStep] = useState(1)
  const totalSteps = 4
  const [role, setRole] = useState<UserRole | "">("")
  const [otp, setOtp] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [careerGoals, setCareerGoals] = useState<string[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the GraphQL mutation
  const [createUser, { loading, error, data }] = useMutation(CREATE_USER_MUTATION);

  // Form data state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    university: "",
    graduationYear: "",
    specialization: "",
    companyName: "",
    institutionName: "",
    industry: "",
    foundationYear: "",
    address: "",
    contactNumber: "",
    website: ""
  })

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Remove specialization handlers as it's now a text field


  // Add interest handler
  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest("")
    }
  }

  // Remove interest handler
  const removeInterest = (interest: string) => {
    setInterests(interests.filter(item => item !== interest))
  }

  // Handle career goal changes
  const handleCareerGoalChange = (goal: string) => {
    if (careerGoals.includes(goal)) {
      setCareerGoals(careerGoals.filter(g => g !== goal))
    } else {
      setCareerGoals([...careerGoals, goal])
    }
  }


  // Validate current step
const validateStep = (stepNum: number) => {
  const errors: Record<string, string> = {}

  if (stepNum === 1) {
    // Validate account creation step
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
  } 
  
  else if (stepNum === 2) {
    // Validate OTP step
    if (!otp.trim()) {
      errors.otp = "OTP is required";
    } else if (otp !== "123456") {
      errors.otp = "Invalid credentials. Please try again.";
    }
  } 
  
  else if (stepNum === 3) {
    // Validate role selection
    if (!role) {
      errors.role = "Please select a role";
    }
  } 
  
  else if (stepNum === 4) {
    // Validate role-specific fields
    if (role === "STUDENT") {
      if (!formData.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required";
      }
      if (!formData.university.trim()) {
        errors.university = "University is required";
      }
      if (!formData.graduationYear.trim()) {
        errors.graduationYear = "Graduation year is required";
      }
      if (!formData.specialization.trim()) {
        errors.specialization = "Specialization is required";
      }
      if (careerGoals.length === 0) {
        errors.careerGoals = "Please select at least one career goal";
      }
    } 
    
    else if (role === "UNIVERSITY") {
      if (!formData.institutionName.trim()) {
        errors.institutionName = "Institution name is required";
      }
      if (!formData.foundationYear.trim()) {
        errors.foundationYear = "Foundation year is required";
      }
      if (!formData.address.trim()) {
        errors.address = "Address is required";
      }
      if (!formData.contactNumber.trim()) {
        errors.contactNumber = "Contact number is required";
      }
    } 
    
    else if (role === "COMPANY") {
      if (!formData.companyName.trim()) {
        errors.companyName = "Company name is required";
      }
      if (!formData.industry.trim()) {
        errors.industry = "Industry is required";
      }
      if (!formData.foundationYear.trim()) {
        errors.foundationYear = "Foundation year is required";
      }
      if (!formData.address.trim()) {
        errors.address = "Address is required";
      }
      if (!formData.contactNumber.trim()) {
        errors.contactNumber = "Contact number is required";
      }
    }
  }

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
}

  // Handle next step
  const nextStep = () => {
    if (!validateStep(step)) return
    
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  // Handle previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Format date for GraphQL ISO format
  const formatDateForGraphQL = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString();
  };

  // Handle form submission with GraphQL mutation
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Create mutation payload based on backend schema
      const payload: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: role
      }

      // Add role-specific fields based on backend requirements
      if (role === "STUDENT") {
        payload.university = formData.university;
        payload.graduationYear = parseInt(formData.graduationYear);
        payload.specialization = formData.specialization; // Send as array with single value
        payload.interests = interests; // Include interests
        payload.careerGoals = careerGoals;
        payload.dateOfBirth = formatDateForGraphQL(formData.dateOfBirth);
      } else if (role === "UNIVERSITY") {
        payload.institutionName = formData.institutionName;
        payload.foundationYear = parseInt(formData.foundationYear);
        payload.address = formData.address;
        payload.contactNumber = formData.contactNumber;
        payload.website = formData.website || null;
      } else if (role === "COMPANY") {
        payload.companyName = formData.companyName;
        payload.industry = formData.industry || "General"; // Default to "General" if not provided
        payload.foundationYear = parseInt(formData.foundationYear);
        payload.address = formData.address;
        payload.contactNumber = formData.contactNumber;
        payload.website = formData.website || null;
      }

      console.log("Submitting form with data:", payload);
      
      // Execute the GraphQL mutation
      const result = await createUser({
        variables: {
          input: payload
        }
      });

      console.log("User created successfully:", result.data);
      
      // Show success notification
      toast({
        title: "Account created successfully!",
        description: "Redirecting you to your dashboard...",
      });

      setTimeout(() => {
        window.location.href="/auth/signin"; // Redirect to login page
      }, 2000);

    } catch (err) {
      console.error("Error creating user:", err);
      setIsSubmitting(false);

      // Show error notification
      toast({
        title: "Error creating account",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full max-w-md  bg-white shadow-lg border border-gray-200">
      <CardHeader className="space-y-1  border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-zinc-800">
            {step === 1 && "Create an account"}
            {step === 2 && "Verify your email"}
            {step === 3 && "Choose your role"}
            {step === 4 && "Complete your profile"}
          </CardTitle>
          <div className="text-sm text-muted-foreground text-zinc-800 ">
            Step {step} of {totalSteps}
          </div>
        </div>
        <CardDescription className="text-zinc-800">
          {step === 1 && "Enter your information to create your account"}
          {step === 2 && "We've sent an OTP to your email. Please verify."}
          {step === 3 && "Select your role to personalize your experience"}
          {step === 4 && "Provide additional information to complete your profile"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-zinc-800">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
                <Label htmlFor="firstName">First name*</Label>
                <Input 
                  id="firstName" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange} 
                  placeholder="John" 
                />
                {formErrors.firstName && <p className="text-sm text-red-500">{formErrors.firstName}</p>}

              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name*</Label>
                <Input 
                  id="lastName" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange} 
                  placeholder="Doe" 
                />
                {formErrors.lastName && <p className="text-sm text-red-500">{formErrors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@university.edu" 
              />
              {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password*</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                value={formData.password}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
              {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password*</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
             {formErrors.fieldName && <p className="text-sm text-green-600 font-medium">{formErrors.fieldName}</p>}
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Label htmlFor="otp">Enter OTP sent to your email*</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="for now enter --> 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {formErrors.otp && <p className="text-sm text-red-500">{formErrors.otp}</p>}
            <p className="text-sm text-muted-foreground">
              Didn't receive the OTP? <button className="text-blue-600 hover:underline">Resend</button>
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>I am a*</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(val) => setRole(val as UserRole)} 
                className="grid gap-4 pt-2"
              >
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="STUDENT" id="student" />
                  <Label htmlFor="student" className="flex flex-col">
                    <span className="font-medium">Student</span>
                    <span className="text-sm text-muted-foreground">For university students looking to connect</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="UNIVERSITY" id="university" />
                  <Label htmlFor="university" className="flex flex-col">
                    <span className="font-medium">University Administrator</span>
                    <span className="text-sm text-muted-foreground">For university staff and administrators</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="COMPANY" id="company" />
                  <Label htmlFor="company" className="flex flex-col">
                    <span className="font-medium">Company</span>
                    <span className="text-sm text-muted-foreground">For companies looking to recruit students</span>
                  </Label>
                </div>
              </RadioGroup>
              {formErrors.role && <p className="text-sm text-red-500">{formErrors.role}</p>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {/* Student fields */}
            {role === "STUDENT" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth*</Label>
                  <Input 
                    id="dateOfBirth" 
                    name="dateOfBirth"
                    type="date" 
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                  {formErrors.dateOfBirth && <p className="text-sm text-red-500">{formErrors.dateOfBirth}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University*</Label>
                  <Input 
                    id="university" 
                    name="university"
                    placeholder="Enter your university name" 
                    value={formData.university}
                    onChange={handleInputChange}
                  />
                  {formErrors.university && <p className="text-sm text-red-500">{formErrors.university}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Expected Graduation Year*</Label>
                  <Input 
                    id="graduationYear" 
                    name="graduationYear"
                    type="number" 
                    placeholder="e.g., 2026" 
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                  />
                  {formErrors.graduationYear && <p className="text-sm text-red-500">{formErrors.graduationYear}</p>}
                </div>

                {/* Specialization section - as a text field */}
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization*</Label>
                  <Input 
                    id="specialization" 
                    name="specialization"
                    placeholder="Enter your specialization (e.g., Computer Science)" 
                    value={formData.specialization}
                    onChange={handleInputChange}
                  />
                  {formErrors.specialization && <p className="text-sm text-red-500">{formErrors.specialization}</p>}
                  <p className="text-xs text-muted-foreground">
                    Your primary field of study or expertise
                  </p>
                </div>

                {/* Interests section */}
                <div className="space-y-2">
                  <Label>Interests (optional)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {interests.map((interest, index) => (
                      <Badge key={index} className="flex items-center gap-1 px-3 py-1 bg-grey-900">
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 text-xs rounded-full hover:bg-grey-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest (e.g., Machine Learning)"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInterest();
                        }
                      }}
                    />
                    <Button
                      onClick={addInterest}
                      variant="outline"
                      type="button"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Career Goals section */}
                <div className="space-y-2">
                  <Label>Career Goals*</Label>
                  <div className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-internship" 
                        checked={careerGoals.includes("Internship")}
                        onCheckedChange={() => handleCareerGoalChange("Internship")}
                      />
                      <Label htmlFor="goal-internship">Internship</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-job" 
                        checked={careerGoals.includes("Full-time Job")}
                        onCheckedChange={() => handleCareerGoalChange("Full-time Job")}
                      />
                      <Label htmlFor="goal-job">Full-time Job</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-networking" 
                        checked={careerGoals.includes("Networking")}
                        onCheckedChange={() => handleCareerGoalChange("Networking")}
                      />
                      <Label htmlFor="goal-networking">Networking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-skills" 
                        checked={careerGoals.includes("Skill Development")}
                        onCheckedChange={() => handleCareerGoalChange("Skill Development")}
                      />
                      <Label htmlFor="goal-skills">Skill Development</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goal-startup" 
                        checked={careerGoals.includes("Startup")}
                        onCheckedChange={() => handleCareerGoalChange("Startup")}
                      />
                      <Label htmlFor="goal-startup">Launch a Startup</Label>
                    </div>
                  </div>
                  {formErrors.careerGoals && <p className="text-sm text-red-500">{formErrors.careerGoals}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {careerGoals.map((goal) => (
                      <Badge key={goal} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* University fields */}
            {role === "UNIVERSITY" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name*</Label>
                  <Input 
                    id="institutionName" 
                    name="institutionName"
                    placeholder="Enter university name" 
                    value={formData.institutionName}
                    onChange={handleInputChange}
                  />
                  {formErrors.institutionName && <p className="text-sm text-red-500">{formErrors.institutionName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundationYear">Foundation Year*</Label>
                  <Input 
                    id="foundationYear" 
                    name="foundationYear"
                    type="number" 
                    placeholder="e.g., 1900" 
                    value={formData.foundationYear}
                    onChange={handleInputChange}
                  />
                  {formErrors.foundationYear && <p className="text-sm text-red-500">{formErrors.foundationYear}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address*</Label>
                  <Input 
                    id="address" 
                    name="address"
                    placeholder="Enter full address" 
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  {formErrors.address && <p className="text-sm text-red-500">{formErrors.address}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number*</Label>
                  <Input 
                    id="contactNumber" 
                    name="contactNumber"
                    placeholder="e.g., +1 234 567 8900" 
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                  {formErrors.contactNumber && <p className="text-sm text-red-500">{formErrors.contactNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    name="website"
                    placeholder="e.g., https://university.edu" 
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* Company fields */}
            {role === "COMPANY" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name*</Label>
                  <Input 
                    id="companyName" 
                    name="companyName"
                    placeholder="Enter company name" 
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                  {formErrors.companyName && <p className="text-sm text-red-500">{formErrors.companyName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry*</Label>
                  <Input 
                    id="industry" 
                    name="industry"
                    placeholder="e.g., Technology, Finance, etc." 
                    value={formData.industry}
                    onChange={handleInputChange}
                  />
                  {formErrors.industry && <p className="text-sm text-red-500">{formErrors.industry}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundationYear">Foundation Year*</Label>
                  <Input 
                    id="foundationYear" 
                    name="foundationYear"
                    type="number" 
                    placeholder="e.g., 2000" 
                    value={formData.foundationYear}
                    onChange={handleInputChange}
                  />
                  {formErrors.foundationYear && <p className="text-sm text-red-500">{formErrors.foundationYear}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address*</Label>
                  <Input 
                    id="address" 
                    name="address"
                    placeholder="Enter full address" 
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  {formErrors.address && <p className="text-sm text-red-500">{formErrors.address}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number*</Label>
                  <Input 
                    id="contactNumber" 
                    name="contactNumber"
                    placeholder="e.g., +1 234 567 8900" 
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                  {formErrors.contactNumber && <p className="text-sm text-red-500">{formErrors.contactNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    name="website"
                    placeholder="e.g., https://company.com" 
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* Remove Admin fields section */}

            {/* Show any GraphQL errors */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">Error: {error.message}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex w-full justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4 text-zinc-800" />
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={nextStep} disabled={isSubmitting} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white transition-colors" >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : step < totalSteps ? (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Complete <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        {step === 1 && (
          <div className="text-center text-sm text-zinc-800">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}                    