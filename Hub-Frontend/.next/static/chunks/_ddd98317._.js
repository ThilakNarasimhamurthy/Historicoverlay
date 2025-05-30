(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/app/apollo/client.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "authTokenVar": (()=>authTokenVar),
    "currentUserVar": (()=>currentUserVar),
    "default": (()=>__TURBOPACK__default__export__),
    "initAuthState": (()=>initAuthState),
    "initializeApollo": (()=>initializeApollo),
    "isLoggedInVar": (()=>isLoggedInVar),
    "logout": (()=>logout),
    "setAuthToken": (()=>setAuthToken),
    "setCurrentUser": (()=>setCurrentUser)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$core$2f$ApolloClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@apollo/client/core/ApolloClient.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$cache$2f$inmemory$2f$inMemoryCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@apollo/client/cache/inmemory/inMemoryCache.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$link$2f$http$2f$createHttpLink$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@apollo/client/link/http/createHttpLink.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$cache$2f$inmemory$2f$reactiveVars$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@apollo/client/cache/inmemory/reactiveVars.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$link$2f$context$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@apollo/client/link/context/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$apollo3$2d$cache$2d$persist$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/apollo3-cache-persist/lib/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$apollo3$2d$cache$2d$persist$2f$lib$2f$persistCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__persistCache$3e$__ = __turbopack_context__.i("[project]/node_modules/apollo3-cache-persist/lib/persistCache.js [app-client] (ecmascript) <export default as persistCache>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$apollo3$2d$cache$2d$persist$2f$lib$2f$storageWrappers$2f$SessionStorageWrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/apollo3-cache-persist/lib/storageWrappers/SessionStorageWrapper.js [app-client] (ecmascript)");
;
;
;
// Safely access client-side storage
const getFromStorage = (key)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            return sessionStorage.getItem(key);
        } catch (e) {
            console.error(`Error accessing sessionStorage for key ${key}:`, e);
            return null;
        }
    }
    return null;
};
const isLoggedInVar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$cache$2f$inmemory$2f$reactiveVars$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeVar"])(false);
const authTokenVar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$cache$2f$inmemory$2f$reactiveVars$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeVar"])('');
const currentUserVar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$cache$2f$inmemory$2f$reactiveVars$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeVar"])(null);
const initAuthState = ()=>{
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    }
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
const setAuthToken = (token)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            sessionStorage.setItem('auth:token', JSON.stringify(token));
        } catch (e) {
            console.error('Error saving auth token to session storage:', e);
        }
    }
    authTokenVar(token);
    isLoggedInVar(!!token);
};
const setCurrentUser = (user)=>{
    if ("TURBOPACK compile-time truthy", 1) {
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
const logout = ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
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
const httpLink = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$link$2f$http$2f$createHttpLink$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHttpLink"])({
    uri: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql'
});
// Auth link that reads token from Apollo cache
const authLink = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$link$2f$context$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setContext"])((_, { headers })=>{
    const token = authTokenVar();
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    };
});
// Configure cache with type policies - UPDATED with new policies
const cache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$cache$2f$inmemory$2f$inMemoryCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InMemoryCache"]({
    typePolicies: {
        Query: {
            fields: {
                // Local fields (client-side only)
                isLoggedIn: {
                    read () {
                        return isLoggedInVar();
                    }
                },
                currentUser: {
                    read () {
                        return currentUserVar();
                    }
                },
                // Server fields with caching policies
                events: {
                    merge (existing, incoming) {
                        return incoming;
                    }
                },
                // Add policies for all event-related queries
                allEvents: {
                    merge (existing, incoming) {
                        return incoming;
                    }
                },
                eventsNearMe: {
                    merge (existing, incoming) {
                        return incoming;
                    }
                },
                myEvents: {
                    merge (existing, incoming) {
                        return incoming;
                    }
                },
                savedEvents: {
                    merge (existing, incoming) {
                        return incoming;
                    }
                },
                userParticipatedEvents: {
                    merge (existing, incoming) {
                        return incoming;
                    }
                }
            }
        },
        // Add policies for Event type
        Event: {
            fields: {
                likeCount: {
                    read (existing) {
                        return existing || 0;
                    }
                },
                saveCount: {
                    read (existing) {
                        return existing || 0;
                    }
                },
                isLikedByUser: {
                    read (existing) {
                        return existing || false;
                    }
                },
                isSavedByUser: {
                    read (existing) {
                        return existing || false;
                    }
                },
                isRegisteredByUser: {
                    read (existing) {
                        return existing || false;
                    }
                }
            }
        },
        // Add policies for ExternalEvent type
        ExternalEvent: {
            fields: {
                likeCount: {
                    read (existing) {
                        return existing || 0;
                    }
                },
                saveCount: {
                    read (existing) {
                        return existing || 0;
                    }
                },
                isLikedByUser: {
                    read (existing) {
                        return existing || false;
                    }
                },
                isSavedByUser: {
                    read (existing) {
                        return existing || false;
                    }
                },
                isRegisteredByUser: {
                    read (existing) {
                        return false; // External events can't be registered
                    }
                }
            }
        }
    }
});
// Create a default Apollo client for SSR and initial client render
const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$core$2f$ApolloClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ApolloClient"]({
    link: authLink.concat(httpLink),
    cache,
    ssrMode: "object" === 'undefined',
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network'
        }
    }
});
const initializeApollo = async ()=>{
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    }
    // Initialize auth state from storage
    initAuthState();
    try {
        // Set up cache persistence
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$apollo3$2d$cache$2d$persist$2f$lib$2f$persistCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__persistCache$3e$__["persistCache"])({
            cache,
            storage: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$apollo3$2d$cache$2d$persist$2f$lib$2f$storageWrappers$2f$SessionStorageWrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SessionStorageWrapper"](window.sessionStorage),
            key: 'apollo-cache',
            debug: false
        });
        console.log('Apollo cache persistence initialized successfully');
    } catch (error) {
        console.error('Error initializing cache persistence:', error);
    }
    return client;
};
const __TURBOPACK__default__export__ = client;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/apollo/provider.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// app/apollo/provider.tsx
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$react$2f$context$2f$ApolloProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@apollo/client/react/context/ApolloProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/apollo/client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
/**
 * A wrapping component to provide Apollo Client to the application.
 * Uses a dynamic import approach to prevent hydration mismatches.
 */ const ApolloWrapper = ({ children })=>{
    _s();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Track when we can start client-side rendering
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ApolloWrapper.useEffect": ()=>{
            setMounted(true);
        }
    }["ApolloWrapper.useEffect"], []);
    // On mount, initialize the Apollo client
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ApolloWrapper.useEffect": ()=>{
            if (mounted) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeApollo"])().catch({
                    "ApolloWrapper.useEffect": (err)=>{
                        console.error('Failed to initialize Apollo Client:', err);
                    }
                }["ApolloWrapper.useEffect"]);
            }
        }
    }["ApolloWrapper.useEffect"], [
        mounted
    ]);
    // Always render the children using the default client
    // This ensures server and client rendering match
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$react$2f$context$2f$ApolloProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApolloProvider"], {
        client: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        children: children
    }, void 0, false, {
        fileName: "[project]/app/apollo/provider.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
};
_s(ApolloWrapper, "BShlRgxf1Xjno/mi6QXyq9ZqIDE=");
_c = ApolloWrapper;
const __TURBOPACK__default__export__ = ApolloWrapper;
var _c;
__turbopack_context__.k.register(_c, "ApolloWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/apollo/operations/auth.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// app/apollo/operations/auth.ts
__turbopack_context__.s({
    "GET_CURRENT_USER": (()=>GET_CURRENT_USER),
    "IS_LOGGED_IN": (()=>IS_LOGGED_IN),
    "LOGIN": (()=>LOGIN),
    "getRoleData": (()=>getRoleData),
    "login": (()=>login),
    "logout": (()=>logout)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$tag$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/graphql-tag/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/apollo/client.ts [app-client] (ecmascript)");
;
;
const IS_LOGGED_IN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$tag$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["gql"]`
  query IsUserLoggedIn {
    isLoggedIn @client
    currentUser @client
  }
`;
const LOGIN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$tag$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["gql"]`
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
const GET_CURRENT_USER = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$tag$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["gql"]`
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
const login = (token, user)=>{
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setAuthToken"])(token);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setCurrentUser"])(user);
    // Store complete user data including role-specific fields
    localStorage.setItem('currentUser', JSON.stringify(user));
};
const logout = ()=>{
    // Use the logout function from client.ts
    __turbopack_context__.r("[project]/app/apollo/client.ts [app-client] (ecmascript)").logout();
    // Clear Apollo cache on logout
    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].clearStore().catch((err)=>{
        console.error('Error clearing Apollo cache:', err);
    });
    // Ensure localStorage is cleared
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
};
const getRoleData = (user)=>{
    if (!user) return null;
    const role = user.role.toLowerCase();
    switch(role){
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/hooks/useProfile.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ProfileProvider": (()=>ProfileProvider),
    "useProfile": (()=>useProfile)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$react$2f$hooks$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@apollo/client/react/hooks/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$operations$2f$auth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/apollo/operations/auth.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const ProfileContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ProfileProvider({ children }) {
    _s();
    // Track client-side rendering
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Track initialization of auth state
    const [isInitializing, setIsInitializing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Track errors for debugging
    const [initError, setInitError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // State for user profile data
    const [profileState, setProfileState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        profilePic: null,
        userName: "",
        userRole: "",
        isLoggedIn: false,
        user: null,
        roleData: null
    });
    // Skip query during SSR
    const { data, loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$react$2f$hooks$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$apollo$2f$operations$2f$auth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IS_LOGGED_IN"], {
        fetchPolicy: 'cache-and-network',
        skip: !mounted,
        notifyOnNetworkStatusChange: true
    });
    // Mark as mounted when on client
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfileProvider.useEffect": ()=>{
            setMounted(true);
        }
    }["ProfileProvider.useEffect"], []);
    // Extract role-specific data from user object
    const extractRoleData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfileProvider.useCallback[extractRoleData]": (user)=>{
            if (!user || !user.role) return null;
            const roleLower = user.role.toLowerCase();
            // Return the appropriate role data based on user role
            switch(roleLower){
                case 'student':
                    return user.student || null;
                case 'university':
                    return user.university || null;
                case 'company':
                    return user.company || null;
                case 'admin':
                    return user.admin || null;
                default:
                    return null;
            }
        }
    }["ProfileProvider.useCallback[extractRoleData]"], []);
    // Initialize state from localStorage and Apollo cache
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfileProvider.useEffect": ()=>{
            // Skip during SSR
            if (!mounted) return;
            try {
                // Safely access localStorage (only on client)
                const storedPic = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("profilePic") : ("TURBOPACK unreachable", undefined);
                const storedName = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("userName") : ("TURBOPACK unreachable", undefined);
                // Get user from Apollo cache
                const user = data?.currentUser || null;
                const isLoggedIn = !!user;
                const userRole = user?.role || "";
                const roleData = extractRoleData(user);
                // Generate user name
                let displayName = "";
                if (user?.firstName && user?.lastName) {
                    displayName = `${user.firstName} ${user.lastName}`;
                } else if (storedName) {
                    displayName = storedName;
                }
                // Update state
                setProfileState({
                    profilePic: user?.avatar || storedPic || null,
                    userName: displayName,
                    userRole,
                    isLoggedIn,
                    user,
                    roleData
                });
            } catch (err) {
                // Log error but don't crash
                console.error("Error initializing profile:", err);
                setInitError(err instanceof Error ? err : new Error(String(err)));
            } finally{
                // Mark initialization as complete
                setIsInitializing(false);
            }
        }
    }["ProfileProvider.useEffect"], [
        mounted,
        data,
        extractRoleData
    ]);
    // Safe setter for profile picture
    const setProfilePic = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfileProvider.useCallback[setProfilePic]": (url)=>{
            if (!mounted) return; // Skip during SSR
            setProfileState({
                "ProfileProvider.useCallback[setProfilePic]": (prev)=>({
                        ...prev,
                        profilePic: url
                    })
            }["ProfileProvider.useCallback[setProfilePic]"]);
            try {
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.setItem("profilePic", url);
                }
            } catch (err) {
                console.error("Error saving profile pic:", err);
            }
        }
    }["ProfileProvider.useCallback[setProfilePic]"], [
        mounted
    ]);
    // Safe setter for user name
    const setUserName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfileProvider.useCallback[setUserName]": (name)=>{
            if (!mounted) return; // Skip during SSR
            setProfileState({
                "ProfileProvider.useCallback[setUserName]": (prev)=>({
                        ...prev,
                        userName: name
                    })
            }["ProfileProvider.useCallback[setUserName]"]);
            try {
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.setItem("userName", name);
                }
            } catch (err) {
                console.error("Error saving user name:", err);
            }
        }
    }["ProfileProvider.useCallback[setUserName]"], [
        mounted
    ]);
    // Get formatted role name
    const getRoleDisplayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfileProvider.useCallback[getRoleDisplayName]": ()=>{
            const role = profileState.userRole?.toLowerCase() || "";
            switch(role){
                case 'student':
                    return "Student";
                case 'university':
                    return "University";
                case 'company':
                    return "Company";
                case 'admin':
                    return "Administrator";
                default:
                    return "User";
            }
        }
    }["ProfileProvider.useCallback[getRoleDisplayName]"], [
        profileState.userRole
    ]);
    // The actual loading state combines multiple factors
    const isLoading = !mounted || isInitializing || loading;
    // Dev-mode logging for auth issues
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfileProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                if (error) {
                    console.warn("Auth query error:", error);
                }
                if (initError) {
                    console.warn("Profile initialization error:", initError);
                }
            }
        }
    }["ProfileProvider.useEffect"], [
        error,
        initError
    ]);
    // Context value
    const contextValue = {
        ...profileState,
        isLoading,
        isInitializing,
        setProfilePic,
        setUserName,
        getRoleDisplayName
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProfileContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/hooks/useProfile.tsx",
        lineNumber: 193,
        columnNumber: 5
    }, this);
}
_s(ProfileProvider, "PmHNX29mMh+FYem42W4xv8+FDAY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$apollo$2f$client$2f$react$2f$hooks$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = ProfileProvider;
function useProfile() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within ProfileProvider");
    }
    return context;
}
_s1(useProfile, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ProfileProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_ddd98317._.js.map