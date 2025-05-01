import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  "/_next/static/(.*)",
  "/_next/image(.*)",
  "/favicon.ico",
  "/manifest.json",
  "/service-worker.js"
]);

export default clerkMiddleware({
  publicRoutes: (req) => isPublicRoute(req),
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 