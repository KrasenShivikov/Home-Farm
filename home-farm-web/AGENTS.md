<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Brief project description
"Home Farm" app: a software product designed to organize the activities (planting, spraying, harvesting, and waste/spoilage) within a family vegetable farm including order from clients 


# Architecture and technology stack
NextJs + React + Tailwind + NeonDb + DrizlleORM

# Backend
 - Implement the app's business logic as services (a service layer), which access the DB with Drizzle.
 - Implement Server Actions for the Web app, which use the services.
 - Implement server-side paging to prevent performance degradation or UI freezing for large datasets.
 - Use external object storage service (is needed) to upload photos and files, e.g. Cloudflare R2.


# Database
 - Use best practices to design the PostgreSQL DB schema (normalization, relationships, indexing).
 - When changing the DB schema, always use Drizzle Kit migrations.
 - Seed enough sample data in all major tables, to ensure performance.


# UI guidelines
 - Implement modern and user-friendly UI design.
 - Implement responsive design for desktop and mobile browsers.
 - Split the UI into components and sub-components. Avoid complex large components.
 - Use icons, effects and visual cues to enhance user experience and make the app more intuitive.
 - Use server-side components in Next.js, unless a browser interaction is needed.


# Authentication and authorization guidelines
 - Use bcrypt, argon2 or other secure password hashing algorithm to store passwords in the DB.
 - Use JWT tokens to implement user sessions. Use cookies for the Web app. Use a random JWT_SECRET key to sign JWT tokens.

