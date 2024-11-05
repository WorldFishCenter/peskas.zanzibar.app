import { NextRequest, NextResponse } from 'next/server';

import getDb from "@repo/nosql";
import { CatchMonthlyModel } from "@repo/nosql/schema/catch-monthly";

export async function GET(req: NextRequest) {
  try {
    await getDb()    
    // Log basic collection info
    const count = await CatchMonthlyModel.countDocuments();
    console.log(`Total documents in catch_monthly: ${count}`);
    
    // Try to get a sample document to verify structure    
    const sampleDoc = await CatchMonthlyModel.findOne({}).exec();
    console.log('Sample document:', sampleDoc);

    // First let's check what BMUs we have
    const bmuList = await CatchMonthlyModel.distinct('BMU');
    console.log('Available BMUs:', bmuList);
    
    const data = await CatchMonthlyModel.aggregate([
      {
        $match: {
          BMU: "Kenyatta"  // We'll verify if this is the correct BMU name from the logs
        }
      },
      {
        $project: {
          _id: 0,
          date: 1,
          mean_trip_catch: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]).exec();
    console.log('Query results:', data);
    console.log('Number of records:', data.length);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Detailed Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}