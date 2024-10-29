import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('app');
    const collection = db.collection('gear_distribution');
    
    // Get data for Bureni and filter out zero counts
    const gearData = await collection
      .find({ 
        landing_site: "Kenyatta",
        gear_n: { $gt: 0 }  // Only get gears with counts greater than 0
      })
      .project({
        _id: 0,
        name: "$gear",
        size: "$gear_n"
      })
      .toArray();

    // Sort by size in descending order
    const sortedData = gearData.sort((a, b) => b.size - a.size);

    const transformedData = [{
      name: "Bureni",
      children: sortedData
    }];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}