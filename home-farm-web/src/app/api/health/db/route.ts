import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

export async function GET() {
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
