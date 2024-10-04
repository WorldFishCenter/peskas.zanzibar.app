import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('app');
    const collection = db.collection('legacy-metrics_gear');
    
    // Aggregate data to get gear type counts for each landing site
    const data = await collection.aggregate([
      {
        $group: {
          _id: { landing_site: "$landing_site", gear_new: "$gear_new" },
          count: { $sum: "$n" }
        }
      },
      {
        $group: {
          _id: "$_id.landing_site",
          children: {
            $push: {
              name: "$_id.gear_new",
              size: "$count"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          children: 1
        }
      }
    ]).toArray();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', (error as Error).message);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}