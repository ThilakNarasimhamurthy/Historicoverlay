(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/app/apollo/client.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// app/apollo/client.ts
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
// Configure cache with type policies
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
}]);

//# sourceMappingURL=app_apollo_931f3bea._.js.map