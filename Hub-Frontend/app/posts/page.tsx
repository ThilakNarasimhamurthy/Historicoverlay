'use client'
import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation"; 
import { 
  ThumbsUp, 
  MessageSquare, 
  MapPin, 
  Plus, 
  X, 
  Loader2,
  AlertCircle,
  Tag,
  Image as ImageIcon,
  Send
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMutation, useQuery } from '@apollo/client';
import { Badge } from "@/components/ui/badge";
import FileUploader from "@/components/uploads/fileuploader";
// Import GraphQL queries and mutations
import { 
  GET_ALL_POSTS,
  GET_MY_POSTS,
  GET_SAVED_POSTS,
  CREATE_POST,
  LIKE_POST,
  ADD_COMMENT,
  GET_PRESIGNED_URL,
  COMPLETE_FILE_UPLOAD
} from '@/app/apollo/mutations/postmutations';
import ProtectedRoute from "@/components/ProtectedRoute";
import { IS_LOGGED_IN } from '@/app/apollo/operations/auth';

// Define the FileUploader ref type
interface FileUploaderRef {
  clear: () => void;
}

// Define the data structure types
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profilePicture?: string;
  email?: string;
}

interface GeoLocation {
  type: string;
  coordinates: number[];
  address?: string;
}

interface Comment {
  id: string;
  userId: string;
  user?: User;
  content: string;
  commentedAt: string;
}

interface Post {
  id: string;
  userId: string;
  user?: User;
  content: string;
  mediaLinks?: string[];
  tags?: string[];
  location?: GeoLocation;
  likes?: { userId: string; likedAt: string }[];
  comments?: Comment[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function PostsPage() {
  // Route parameter handling
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get('role');
  const [userRole, setUserRole] = useState('student'); // Default role
  
  // State management
  const [postContent, setPostContent] = useState("");
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const { toast } = useToast();
  
  // Comments state
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // FileUploader ref
  const fileUploaderRef = useRef<FileUploaderRef>(null);
  
  // Get current user from auth system
  const { data: authData, loading: authLoading } = useQuery(IS_LOGGED_IN);
  const currentUser = authData?.currentUser;
  
  // Update role when URL parameter changes
  useEffect(() => {
    // Validate the role parameter
    if (roleParam && ['student', 'university', 'company'].includes(roleParam)) {
      setUserRole(roleParam);
    } else if (roleParam) {
      // If role is invalid, redirect to a valid role (student by default)
      router.replace(`/posts?role=student`);
    } else {
      // If no role provided, add it to URL
      router.replace(`/posts?role=student`);
    }
  }, [roleParam, router]);
  
  // GraphQL hooks
  const [createPost, { loading: isCreatingPost }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_ALL_POSTS }, { query: GET_MY_POSTS, variables: { userId: currentUser?.id } }],
    onError: (error) => {
      console.error("Detailed GraphQL error:", error);
      setUploadError("Failed to create post. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create your post. Please try again.",
      });
    }
  });
  const [likePost] = useMutation(LIKE_POST);
  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_ALL_POSTS }, { query: GET_MY_POSTS, variables: { userId: currentUser?.id } }]
  });
  
  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Get user initials from firstName and lastName
  const getUserInitials = (user?: { firstName?: string; lastName?: string; name?: string; }) => {
    if (!user) return 'U';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    } else if (user.firstName) {
      return user.firstName.charAt(0);
    } else if (user.name) {
      return user.name.charAt(0);
    }
    
    return 'U';
  };
  
  // Get full name from user object
  const getFullName = (user?: { firstName?: string; lastName?: string; name?: string; }) => {
    if (!user) return 'User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.name) {
      return user.name;
    }
    
    return 'User';
  };
  
  const { data: allPostsData, loading: allPostsLoading } = useQuery(GET_ALL_POSTS);
  const { data: myPostsData, loading: myPostsLoading } = useQuery(GET_MY_POSTS, {
    variables: { userId: currentUser?.id },
    skip: !currentUser?.id // Skip query if user ID not available
  });
  const { data: savedPostsData, loading: savedPostsLoading } = useQuery(GET_SAVED_POSTS);
  
  // Use real data if available, otherwise use empty arrays
  const posts: Post[] = allPostsData?.posts || [];
  const myPosts: Post[] = myPostsData?.postsByUser || [];
  const savedPosts: Post[] = savedPostsData?.posts || [];

  // DEBUG: Log media URLs when posts load
  useEffect(() => {
    if (posts && posts.length > 0) {
      posts.forEach(post => {
        if (post.mediaLinks && post.mediaLinks.length > 0) {
          console.log(`Post ${post.id} media links:`, post.mediaLinks);
        }
      });
    }
  }, [posts]);

  // Toggle location input
  const toggleLocationInput = () => {
    setShowLocationInput(!showLocationInput);
    if (showLocationInput) {
      setLocation("");
    }
  };
  
  // Toggle tag input
  const toggleTagInput = () => {
    setShowTagInput(!showTagInput);
    if (showTagInput) {
      setTagInput("");
    }
  };
  
  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() === "") return;
    
    // Check if tag already exists
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    
    // Clear input
    setTagInput("");
  };
  
  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle tag input key press (add tag on Enter)
  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Handle media upload completion
  const handleUploadComplete = (urls: string[]) => {
    setMediaUrls(prevUrls => [...prevUrls, ...urls]);
    
    if (urls.length > 0) {
      toast({
        title: "Files uploaded",
        description: `${urls.length} file${urls.length === 1 ? '' : 's'} uploaded successfully`,
      });
    }
  };
  
  // Remove media URL from the array
  const removeMediaUrl = (index: number) => {
    setMediaUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };
  
  // Toggle comment section for a post
  const toggleCommentSection = (postId: string) => {
    setOpenCommentPostId(prevId => prevId === postId ? null : postId);
    setCommentText(""); // Clear comment text when toggling
  };
  
  // Handle submitting a comment
  const handleSubmitComment = async (postId: string) => {
    if (!currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to comment"
      });
      return;
    }
    
    if (commentText.trim() === '') {
      return;
    }
    
    try {
      setIsSubmittingComment(true);
      
      await addComment({
        variables: {
          postId,
          userId: currentUser.id,
          content: commentText
        }
      });
      
      // Clear comment text and close comment section
      setCommentText("");
      setOpenCommentPostId(null);
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add your comment. Please try again.",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Prepare location data in the correct format if provided
  const prepareLocationData = () => {
    if (!location) return null;
    
    // For simplicity, we're just using a placeholder.
    // In a real app, you might want to geocode the location string
    return {
      type: "Point",
      coordinates: [0, 0] // [longitude, latitude]
    };
  };
  
  const handleCreatePost = async () => {
    if (!currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to create a post"
      });
      return;
    }
    
    if (postContent.trim() === '' && mediaUrls.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty post",
        description: "Please add some content or media to your post"
      });
      return;
    }
    
    try {
      console.log("Creating post with media URLs:", mediaUrls);
      
      // Make sure the variables are wrapped in an input object
      const { data } = await createPost({
        variables: {
          input: {  // This 'input' wrapper is crucial!
            userId: currentUser.id,
            content: postContent,
            mediaLinks: mediaUrls,
            tags: tags,
            location: location
          }
        }
      });
      
      // Show success message
      toast({
        title: "Post created successfully",
        description: "Your post has been published",
      });

      // Reset form
      setPostContent("");
      setLocation("");
      setShowLocationInput(false);
      setTags([]);
      setTagInput("");
      setShowTagInput(false);
      setMediaUrls([]);
      setUploadError(null);
      
      // Explicitly clear the file uploader
      if (fileUploaderRef.current) {
        fileUploaderRef.current.clear();
      }
      
    } catch (error) {
      console.error("Error creating post:", error);
      setUploadError("Failed to create post. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create your post. Please try again.",
      });
    }
  };
  
  const handleLikePost = async (postId: string) => {
    if (!currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to like a post"
      });
      return;
    }
    
    try {
      await likePost({
        variables: { 
          postId,
          userId: currentUser.id
        }
      });
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like the post. Please try again.",
      });
    }
  };
  
  // Format text for display based on role
  const getRoleSpecificContent = () => {
    const roleName = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    
    // Post type label differs by role
    let postType = "Posts";
    let postPlaceholder = "What's on your mind?";
    
    if (userRole === 'company') {
      postType = " Postings";
      postPlaceholder = "Share a job opportunity...";
    } else if (userRole === 'university') {
      postType = "Announcements";
      postPlaceholder = "Share an announcement with students...";
    }
    
    return { roleName, postType, postPlaceholder };
  };
  
  const { roleName, postType, postPlaceholder } = getRoleSpecificContent();
  
  // Determine if the post can be submitted
  const canSubmitPost = () => {
    return (
      !isCreatingPost &&
      !isUploadingFiles &&
      (postContent.trim() !== '' || mediaUrls.length > 0)
    );
  };
  
  // Determine the media type from URL
  const getMediaType = (url: string) => {
    if (!url) return 'unknown';
    
    console.log('Checking media type for URL:', url);
    
    // Check for image extensions
    if (url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      return 'image';
    }
    
    // Check for video extensions
    if (url.match(/\.(mp4|mov|avi|wmv|webm|mkv|flv)$/i)) {
      return 'video';
    }
    
    // Check for S3 patterns
    if (url.includes('s3.') && url.includes('amazonaws.com')) {
      // Further analyze S3 URLs
      if (url.match(/\/(Post|post)\//) && !url.match(/\.(mp4|mov|avi|wmv|webm|mkv|flv)$/i)) {
        return 'image'; // Assume images in Post folder without video extensions
      }
    }
    
    return 'other';
  };
  
  // Render media preview - UPDATED
  const renderMediaPreview = (url: string, index: number) => {
    const mediaType = getMediaType(url);
    console.log(`Media type for ${url}: ${mediaType}`);
    
    if (mediaType === 'image') {
      return (
        <img 
          src={url} 
          alt={`Uploaded media ${index}`} 
          className="w-full h-32 object-cover"
          onError={(e) => {
            console.error(`Failed to load image: ${url}`);
            // Set a fallback image
            e.currentTarget.src = "/placeholder.png";
            // Add a class to show it's a fallback
            e.currentTarget.classList.add("image-load-error");
          }}
        />
      );
    } else if (mediaType === 'video') {
      return (
        <video 
          src={url} 
          className="w-full h-32 object-cover" 
          controls={false}
          onError={(e) => {
            console.error(`Failed to load video: ${url}`);
            e.currentTarget.classList.add("video-load-error");
          }}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-32 bg-muted">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">File uploaded</p>
          <p className="text-xs text-blue-500 hover:underline mt-1">
            <a href={url} target="_blank" rel="noopener noreferrer">Open</a>
          </p>
        </div>
      );
    }
  };
  
  // Render post card
  const renderPostCard = (post: Post, isMyPost = false) => {
    return (
      <Card key={post.id}>
        <CardContent className="p-6">
          {!isMyPost && (
            <div className="flex items-start space-x-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user?.profilePicture} alt={post.user?.name} />
                <AvatarFallback>{getUserInitials(post.user)}</AvatarFallback>
              </Avatar>
              <div>
              <p className="font-medium">{getFullName(post.user)}</p>
              <p className="text-xs text-muted-foreground">
                  {formatDate(post.createdAt)}
                </p>
                {/* {post.location && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" /> 
                    {post.location.address || "Location"}
                  </p>
                )} */}
              </div>
            </div>
          )}
          <p className="text-sm mb-4">{post.content}</p>
          
          {/* Display post media */}
{post.mediaLinks && post.mediaLinks.length > 0 && (
  <div className={`mb-4 ${post.mediaLinks.length > 1 ? 'relative' : ''}`}>
    {post.mediaLinks.length > 1 ? (
      // For multiple media items - create a horizontal scrollable container
      <div className="overflow-x-auto flex space-x-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {post.mediaLinks.map((url: string, index: number) => {
          const mediaType = getMediaType(url);
          const isPdf = url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('/pdf/');
          
          return (
            <div key={index} className="relative rounded-md overflow-hidden border flex-shrink-0" style={{width: "calc(100% - 2rem)"}}>
              {mediaType === 'image' ? (
                <div className="flex justify-center">
                  <img
                    src={url}
                    alt={`Post media ${index}`}
                    className="max-h-[400px] object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                      e.currentTarget.classList.add("image-load-error");
                    }}
                  />
                </div>
              ) : mediaType === 'video' ? (
                <div className="relative">
                  <video
                    src={url}
                    className="max-h-[400px] object-contain"
                    controls
                    poster="/video-poster.png"
                    onError={(e) => {
                      console.error(`Failed to load video: ${url}`);
                      e.currentTarget.classList.add("video-load-error");
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/50 p-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              ) : isPdf ? (
                <div className="flex flex-col items-center justify-center h-48 bg-muted">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex flex-col items-center p-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mb-2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <path d="M9 15v-2h6v2"></path>
                    </svg>
                    <p className="text-sm font-medium">PDF Document</p>
                    <p className="text-xs mt-1">Click to open</p>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 bg-muted">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex flex-col items-center p-4"
                  >
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">File {index + 1}</p>
                    <p className="text-xs mt-1">Click to open</p>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    ) : (
      // For single media item - full width display
      <div className="relative rounded-md overflow-hidden border">
        {(() => {
          const url = post.mediaLinks[0];
          const mediaType = getMediaType(url);
          const isPdf = url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('/pdf/');
          
          if (mediaType === 'image') {
            return (
              <div className="flex justify-center">
                <img
                  src={url}
                  alt="Post media"
                  className="max-w-full max-h-[500px] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
                    e.currentTarget.classList.add("image-load-error");
                  }}
                />
              </div>
            );
          } else if (mediaType === 'video') {
            return (
              <div className="relative">
                <video
                  src={url}
                  className="w-full max-h-[500px] object-contain"
                  controls
                  poster="/video-poster.png"
                  onError={(e) => {
                    console.error(`Failed to load video: ${url}`);
                    e.currentTarget.classList.add("video-load-error");
                  }}
                />
                <div className="absolute top-2 left-2 bg-black/50 p-1 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            );
          } else if (isPdf) {
            return (
              <div className="flex flex-col items-center justify-center h-48 bg-muted">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex flex-col items-center p-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mb-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M9 15v-2h6v2"></path>
                  </svg>
                  <p className="text-sm font-medium">PDF Document</p>
                  <p className="text-xs mt-1">Click to open</p>
                </a>
              </div>
            );
          } else {
            return (
              <div className="flex flex-col items-center justify-center h-48 bg-muted">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex flex-col items-center p-4"
                >
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <p className="text-sm font-medium">File</p>
                  <p className="text-xs mt-1">Click to open</p>
                </a>
              </div>
            );
          }
        })()}
      </div>
    )}
  </div>
)}

          {/* Display post tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 border-t flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => handleLikePost(post.id)}
          >
            <ThumbsUp className="h-4 w-4" /> {post.likesCount}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => toggleCommentSection(post.id)}
          >
            <MessageSquare className="h-4 w-4" /> {post.commentsCount}
          </Button>
        </CardFooter>
        
        {/* Comment section */}
        {openCommentPostId === post.id && (
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={currentUser?.profilePicture || "/placeholder.png"} 
                  alt={currentUser?.firstName || "User"} 
                />
                <AvatarFallback>
                  {currentUser?.firstName ? currentUser.firstName.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                  disabled={isSubmittingComment}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment(post.id);
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  onClick={() => handleSubmitComment(post.id)}
                  disabled={commentText.trim() === '' || isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Comment list would go here if you want to display existing comments */}
            {post.comments && post.comments.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium">Comments</p>
                {post.comments.map((comment: Comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={comment.user?.profilePicture} 
                        alt={comment.user?.name} 
                      />
                      <AvatarFallback>
                        {comment.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-md px-3 py-2 flex-1">
                      <p className="text-xs font-medium">{comment.user?.name}</p>
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.commentedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };
  
  // Show loading state when checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <ProtectedRoute allowedRoles={['student', 'university', 'company', 'admin']}>
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <DashboardHeader heading={`${postType}`} text={`Share updates, questions, and connect with your community.`} />

        {currentUser && (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.profilePicture || "/placeholder.png?height=40&width=40"} alt={currentUser.firstName || "User"} />
                  <AvatarFallback>
                    {currentUser.firstName ? currentUser.firstName.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea 
                    placeholder={postPlaceholder} 
                    className="min-h-[100px] resize-none mb-3" 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    disabled={isCreatingPost}
                  />
  
                  {/* File Uploader Component */}
                  <FileUploader 
                    ref={fileUploaderRef}
                    onUploadComplete={handleUploadComplete}
                    allowedTypes="image/*,video/*,application/pdf"
                    maxFiles={5} 
                    onUploadStarted={() => setIsUploadingFiles(true)}
                    onUploadFinished={() => setIsUploadingFiles(false)}
                    clearAfterUpload={true}
                  />
                  
                  {/* Display uploaded media */}
                  {mediaUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {mediaUrls.map((url: string, index: number) => (
                        <div key={index} className="relative rounded-md overflow-hidden border">
                          {renderMediaPreview(url, index)}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                            onClick={() => removeMediaUrl(index)}
                            disabled={isCreatingPost}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show location input if enabled */}
                  {showLocationInput && (
                    <div className="flex items-center gap-2 mt-3 mb-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Add your location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1"
                        disabled={isCreatingPost}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setShowLocationInput(false);
                          setLocation("");
                        }}
                        disabled={isCreatingPost}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Show tag input if enabled */}
                  {showTagInput && (
                    <div className="flex items-center gap-2 mt-3 mb-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Add tags (press Enter after each tag)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        className="flex-1"
                        disabled={isCreatingPost}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleAddTag}
                        disabled={tagInput.trim() === "" || isCreatingPost}
                      >
                        Add
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setShowTagInput(false);
                          setTagInput("");
                        }}
                        disabled={isCreatingPost}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Display tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 mt-3">
                      {tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button 
                            onClick={() => removeTag(tag)} 
                            className="ml-1 h-4 w-4 rounded-full hover:bg-muted p-0"
                            disabled={isCreatingPost}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Error message */}
                  {uploadError && (
                    <Alert variant="destructive" className="mt-3 mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between px-6 pb-6 pt-0">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`gap-1 ${showLocationInput ? 'bg-muted' : ''}`}
                  onClick={toggleLocationInput}
                  disabled={isCreatingPost}
                >
                  <MapPin className="h-4 w-4" /> Location
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`gap-1 ${showTagInput ? 'bg-muted' : ''}`}
                  onClick={toggleTagInput}
                  disabled={isCreatingPost}
                >
                  <Tag className="h-4 w-4" /> Tags
                </Button>
              </div>
              <Button 
                onClick={handleCreatePost}
                disabled={!canSubmitPost()}
              >
                {isCreatingPost ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  userRole === 'company' ? 'Post Job' : 'Post'
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        <Tabs 
          defaultValue="all" 
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="all">All {postType}</TabsTrigger>
            <TabsTrigger value="my">My {postType}</TabsTrigger>
            {/* <TabsTrigger value="saved">Saved</TabsTrigger> */}
          </TabsList>

          {/* All posts tab */}
          <TabsContent value="all" className="space-y-6">
            {allPostsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => renderPostCard(post))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">No {postType.toLowerCase()} yet</p>
              </div>
            )}
          </TabsContent>

          {/* My posts tab */}
          <TabsContent value="my">
            {myPostsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : myPosts.length > 0 ? (
              myPosts.map((post) => renderPostCard(post, true))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't created any {postType.toLowerCase()} yet</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First {userRole === 'company' ? 'Job Posting' : 'Post'}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Saved posts tab
          <TabsContent value="saved">
            {savedPostsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : savedPosts.length > 0 ? (
              savedPosts.map((post) => renderPostCard(post))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">No saved {postType.toLowerCase()} yet</p>
                <Button variant="outline">Browse All {postType}</Button>
              </div>
            )}
          </TabsContent> */}
        </Tabs>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}