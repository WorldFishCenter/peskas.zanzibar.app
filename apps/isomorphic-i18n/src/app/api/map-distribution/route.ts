import { NextRequest, NextResponse } from 'next/server';

import getDb from "@repo/nosql";
import { MapDistributionModel } from "@repo/nosql/schema/map-distribution";

export async function GET(req: NextRequest) {
  try {
    await getDb()
    const data = await MapDistributionModel
      .find({})
      .select({
        _id: 0,
      })      
      .exec();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}