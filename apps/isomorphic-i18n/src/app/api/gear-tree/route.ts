import { NextRequest, NextResponse } from 'next/server';

import getDb from "@repo/nosql";
import { GearDistributionModel } from "@repo/nosql/schema/gear-distribution";


export async function GET(req: NextRequest) {
  try {
    await getDb()
    const gearData = await GearDistributionModel
      .find({ 
        landing_site: "Kenyatta",
        gear_n: { $gt: 0 }  // Only get gears with counts greater than 0
      })
      .select({
        _id: 0,
        gear: 1,
        gear_n: 1
      })
      .sort({ gear_n: -1 })
      .exec();

    const transformedData = [{
      name: "Bureni",
      children: gearData.map(({gear, gear_n}: {gear: string, gear_n: number}) => ({ name: gear, size: gear_n }))
    }];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}