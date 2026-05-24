import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { crops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/api-middleware";

interface CropResponse {
  id: number;
  name: string;
  variety: string | null;
  forSale: boolean;
  price: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const forSaleOnly = searchParams.get("forSale") === "true";

    const cropFields = {
      id: crops.id,
      name: crops.name,
      variety: crops.variety,
      forSale: crops.forSale,
      price: crops.price,
    };

    const cropsList = forSaleOnly
      ? await db.select(cropFields).from(crops).where(eq(crops.forSale, true))
      : await db.select(cropFields).from(crops);

    return NextResponse.json({
      crops: cropsList.map((c) => ({
        id: c.id,
        name: c.name,
        variety: c.variety,
        forSale: c.forSale,
        price: c.price?.toString() || null,
      })) as CropResponse[],
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
