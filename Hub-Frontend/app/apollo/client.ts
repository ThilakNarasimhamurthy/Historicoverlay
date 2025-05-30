import { ApolloClient, InMemoryCache, NormalizedCacheObject, createHttpLink, makeVar } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { persistCache, SessionStorageWrapper } from 'apollo3-cache-persist';

// Type definitions
export interface User {
  id: string;
  role: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Safely access client-side storage
const getFromStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.error(`Error accessing sessionStorage for key ${key}:`, e);
      return null;
    }
  }
  return null;
};

// Reactive variables for auth state
// Initialize with empty values to ensure consistent server/client rendering
export const isLoggedInVar = makeVar<boolean>(false);
export const authTokenVar = makeVar<string>('');
export const currentUserVar = makeVar<User | null>(null);

// Function to initialize auth state from storage
// Only called on the client after hydration
export const initAuthState = (): void => {
  if (typeof window === 'undefined') return;
  
  // Initialize auth token
  const savedToken = getFromStorage('auth:token');
  if (savedToken) {
    try {
      const token = JSON.parse(savedToken);
      authTokenVar(token);
      isLoggedInVar(true);
    } catch (e) {
      console.error('Error parsing auth token:', e);
    }
  }

  // Initialize user
  const savedUser = getFromStorage('auth:user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      currentUserVar(user);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
};

// Save reactive variables to session storage when they change
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('auth:token', JSON.stringify(token));
    } catch (e) {
      console.error('Error saving auth token to session storage:', e);
    }
  }
  authTokenVar(token);
  isLoggedInVar(!!token);
};

export const setCurrentUser = (user: User | null): void => {
  if (typeof window !== 'undefined') {
    try {
      if (user) {
        sessionStorage.setItem('auth:user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('auth:user');
      }
    } catch (e) {
      console.error('Error saving user to session storage:', e);
    }
  }
  currentUserVar(user);
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('auth:token');
      sessionStorage.removeItem('auth:user');
    } catch (e) {
      console.error('Error clearing session storage during logout:', e);
    }
  }
  authTokenVar('');
  currentUserVar(null);
  isLoggedInVar(false);
};

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});

// Auth link that reads token from Apollo cache
const authLink = setContext((_, { headers }) => {
  const token = authTokenVar();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Configure cache with type policies - UPDATED with new policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Local fields (client-side only)
        isLoggedIn: {
          read() {
            return isLoggedInVar();
          }
        },
        currentUser: {
          read() {
            return currentUserVar();
          }
        },
        // Server fields with caching policies
        events: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        // Add policies for all event-related queries
        allEvents: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        eventsNearMe: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        myEvents: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        savedEvents: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        userParticipatedEvents: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    // Add policies for Event type
    Event: {
      fields: {
        likeCount: {
          read(existing) {
            return existing || 0;
          }
        },
        saveCount: {
          read(existing) {
            return existing || 0;
          }
        },
        isLikedByUser: {
          read(existing) {
            return existing || false;
          }
        },
        isSavedByUser: {
          read(existing) {
            return existing || false;
          }
        },
        isRegisteredByUser: {
          read(existing) {
            return existing || false;
          }
        }
      }
    },
    // Add policies for ExternalEvent type
    ExternalEvent: {
      fields: {
        likeCount: {
          read(existing) {
            return existing || 0;
          }
        },
        saveCount: {
          read(existing) {
            return existing || 0;
          }
        },
        isLikedByUser: {
          read(existing) {
            return existing || false;
          }
        },
        isSavedByUser: {
          read(existing) {
            return existing || false;
          }
        },
        isRegisteredByUser: {
          read(existing) {
            return false; // External events can't be registered
          }
        }
      }
    }
  },
});

// Create a default Apollo client for SSR and initial client render
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  ssrMode: typeof window === 'undefined',
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

// Initialize apollo client with an asynchronous function
// This should only be called on the client after hydration
export const initializeApollo = async (): Promise<ApolloClient<NormalizedCacheObject>> => {
  if (typeof window === 'undefined') {
    console.warn('initializeApollo called on server - returning default client');
    return client;
  }

  // Initialize auth state from storage
  initAuthState();

  try {
    // Set up cache persistence
    await persistCache({
      cache,
      storage: new SessionStorageWrapper(window.sessionStorage),
      key: 'apollo-cache',
      debug: false,
    });
    console.log('Apollo cache persistence initialized successfully');
  } catch (error) {
    console.error('Error initializing cache persistence:', error);
  }

  return client;
};

export default client;