import { NextRequest, NextResponse } from 'next/server';

import getDb from "@repo/nosql";
import { GearDistributionModel } from "@repo/nosql/schema/gear-distribution";

export async function GET(req: NextRequest) {
  try { 
    await getDb() 
    const data = await GearDistributionModel.find({}).exec();

    // Transform data for the stacked bar chart
    const transformedData = data.reduce((acc: any[], curr) => {
      const existingSite = acc.find(item => item.landing_site === curr.landing_site);
      
      if (existingSite) {
        existingSite[curr.gear] = curr.gear_perc;
      } else {
        acc.push({
          landing_site: curr.landing_site,
          [curr.gear]: curr.gear_perc
        });
      }
      
      return acc;
    }, []);

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching gear distribution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}