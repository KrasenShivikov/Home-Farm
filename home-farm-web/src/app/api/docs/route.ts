import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

function getDatabaseUrlSummary(databaseUrl: string | undefined) {
  const normalized = databaseUrl?.trim().replace(/^['"]|['"]$/g, "");

  if (!normalized) {
    return {
      hasDatabaseUrl: false,
      host: null,
      database: null,
    };
  }

  try {
    const parsed = new URL(normalized);

    return {
      hasDatabaseUrl: true,
      host: parsed.host,
      database: parsed.pathname.replace(/^\//, "") || null,
      sslmode: parsed.searchParams.get("sslmode"),
    };
  } catch {
    return {
      hasDatabaseUrl: true,
      host: "invalid-url",
      database: null,
      sslmode: null,
    };
  }
}

function getErrorSummary(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause instanceof Error ? error.cause.message : null,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
    cause: null,
  };
}

async function getDbHealth() {
  const databaseUrl = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  const env = getDatabaseUrlSummary(process.env.DATABASE_URL);

  if (!databaseUrl) {
    return NextResponse.json({ ok: false, env }, { status: 500 });
  }

  try {
    const sql = neon(databaseUrl);
    const [databaseInfo] = await sql`
      select current_database() as database_name
    `;
    const cropColumns = await sql`
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'crops'
      order by ordinal_position
    `;

    return NextResponse.json({
      ok: true,
      env,
      databaseName: databaseInfo?.database_name ?? null,
      cropColumns: cropColumns.map((column) => column.column_name),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        env,
        error: getErrorSummary(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("health") === "db") {
    return getDbHealth();
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home Farm API Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; padding: 20px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #e8520f; margin-bottom: 10px; font-size: 28px; }
    h2 { color: #e8520f; margin-top: 24px; margin-bottom: 12px; font-size: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; }
    h3 { color: #333; margin-top: 16px; margin-bottom: 8px; font-size: 16px; }
    .method { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px; }
    .get { background: #dcfce7; color: #166534; }
    .post { background: #dbeafe; color: #1e40af; }
    .patch { background: #fef3c7; color: #92400e; }
    .endpoint { font-family: 'Courier New', monospace; color: #666; font-size: 14px; margin: 4px 0; }
    .description { margin: 8px 0; color: #555; }
    .param { background: #f8f9fa; padding: 8px 12px; border-radius: 4px; margin: 4px 0; font-size: 13px; }
    .param-name { font-weight: bold; color: #e8520f; }
    code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-size: 13px; }
    .auth-note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 16px 0; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌾 Home Farm API</h1>
    <p class="description">RESTful API for the Home Farm mobile application.</p>

    <div class="auth-note">
      <strong>⚠️ Authentication:</strong> All endpoints (except login) require a JWT token. Send it in the Authorization header:<br>
      <code>Authorization: Bearer &lt;token&gt;</code><br>
      The token is returned from POST /api/auth/login and POST /api/auth/register.
    </div>

    <h2>Authentication</h2>
    <h3><span class="method post">POST</span><span class="endpoint">/api/auth/login</span></h3>
    <p class="description">Login with email and password. Returns a JWT token.</p>
    <div class="param">
      <div class="param-name">Body:</div>
      <pre>{
  "email": "user@example.com",
  "password": "secret123"
}</pre>
    </div>
    <div class="param">
      <div class="param-name">Response:</div>
      <pre>{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "name": "John",
    "email": "user@example.com",
    "role": "user"
  }
}</pre>
    </div>

    <h3><span class="method post">POST</span><span class="endpoint">/api/auth/register</span></h3>
    <p class="description">Create a new user account. Returns a JWT token and the created user.</p>
    <div class="param">
      <div class="param-name">Body:</div>
      <pre>{
  "name": "John",
  "email": "user@example.com",
  "password": "secret123"
}</pre>
    </div>
    <div class="param">
      <div class="param-name">Response:</div>
      <pre>{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "name": "John",
    "email": "user@example.com",
    "role": "user"
  }
}</pre>
    </div>

    <h2>Profile</h2>

    <h3><span class="method get">GET</span><span class="endpoint">/api/profile</span></h3>
    <p class="description">Get the authenticated user's profile and saved shipping details.</p>
    <div class="param">
      <div class="param-name">Response:</div>
      <pre>{
  "user": {
    "id": 1,
    "name": "John",
    "email": "user@example.com",
    "role": "user",
    "shippingCity": "Sofia",
    "shippingStreet": "Main St",
    "shippingPostalCode": "1000",
    "shippingCountry": "Bulgaria"
  }
}</pre>
    </div>

    <h3><span class="method patch">PATCH</span><span class="endpoint">/api/profile</span></h3>
    <p class="description">Update the authenticated user's profile and shipping details.</p>
    <div class="param">
      <div class="param-name">Body:</div>
      <pre>{
  "name": "John",
  "email": "user@example.com",
  "shippingCity": "Sofia",
  "shippingStreet": "Main St",
  "shippingPostalCode": "1000",
  "shippingCountry": "Bulgaria"
}</pre>
    </div>
    <div class="param">
      <div class="param-name">Response:</div>
      <pre>{
  "user": {
    "id": 1,
    "name": "John",
    "email": "user@example.com",
    "role": "user",
    "shippingCity": "Sofia",
    "shippingStreet": "Main St",
    "shippingPostalCode": "1000",
    "shippingCountry": "Bulgaria"
  }
}</pre>
    </div>

    <h2>Orders</h2>

    <h3><span class="method get">GET</span><span class="endpoint">/api/orders?page=1&limit=20&status=Pending</span></h3>
    <p class="description">List orders with optional filtering and pagination.</p>
    <div class="param">
      <div class="param-name">Query Params:</div>
      <table>
        <tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
        <tr><td>page</td><td>number</td><td>1</td><td>Page number</td></tr>
        <tr><td>limit</td><td>number</td><td>20</td><td>Items per page</td></tr>
        <tr><td>status</td><td>string</td><td>-</td><td>Filter by status (Pending, Accepted, Completed, Cancelled)</td></tr>
      </table>
    </div>
    <div class="param">
      <div class="param-name">Response:</div>
      <pre>{
  "orders": [
    {
      "id": 1,
      "status": "Pending",
      "createdAt": "2026-05-22T10:00:00Z",
      "totalItems": 3,
      "totalAmount": "45.00",
      "shippingCity": "Sofia",
      "items": [
        {
          "lineId": 1,
          "cropId": 5,
          "cropName": "Tomatoes",
          "quantity": "2.000",
          "price": "5.00"
        }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 20, "hasMore": false }
}</pre>
    </div>

    <h3><span class="method get">GET</span><span class="endpoint">/api/orders/{id}</span></h3>
    <p class="description">Get order details by ID.</p>
    <div class="param">
      <div class="param-name">Path Params:</div>
      <table>
        <tr><th>Name</th><th>Type</th><th>Description</th></tr>
        <tr><td>id</td><td>number</td><td>Order ID, for example <code>/api/orders/1</code></td></tr>
      </table>
    </div>
    <div class="param">
      <div class="param-name">Response:</div>
      <pre>{
  "order": {
    "id": 1,
    "status": "Pending",
    "createdAt": "2026-05-22T10:00:00Z",
    "totalItems": 3,
    "totalAmount": "45.00",
    "shippingCity": "Sofia",
    "shippingStreet": "Main St",
    "items": [...]
  }
}</pre>
    </div>

    <h3><span class="method post">POST</span><span class="endpoint">/api/orders/{id}/edit</span></h3>
    <p class="description">Update order status. Only Pending orders can be edited.</p>
    <div class="param">
      <div class="param-name">Body:</div>
      <pre>{
  "status": "Accepted"
}</pre>
    </div>
    <div class="param">
      <div class="param-name">Allowed statuses:</div>
      <code>Pending, Accepted, Completed, Cancelled</code>
    </div>

    <h3><span class="method post">POST</span><span class="endpoint">/api/orders/{id}/create_order_line</span></h3>
    <p class="description">Add an order line to a Pending order.</p>
    <div class="param">
      <div class="param-name">Body:</div>
      <pre>{
  "cropId": 5,
  "quantity": "2.000",
  "price": "5.00"
}</pre>
    </div>
    <div class="param">
      <div class="param-name">Response:</div>
      <pre>{
  "success": true,
  "lineId": 42
}</pre>
    </div>

    <h2>Order Statuses</h2>
    <table>
      <tr><th>Status</th><th>Description</th></tr>
      <tr><td>Pending</td><td>Order created, awaiting confirmation</td></tr>
      <tr><td>Accepted</td><td>Order accepted by admin</td></tr>
      <tr><td>Completed</td><td>Order fulfilled</td></tr>
      <tr><td>Cancelled</td><td>Order cancelled</td></tr>
    </table>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
