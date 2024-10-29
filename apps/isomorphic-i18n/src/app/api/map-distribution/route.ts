import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('app');
    const collection = db.collection('map_distribution');
    
    const data = await collection
      .find({}, {
        projection: {
          _id: 0,
          landing_site: 1,
          lat: 1,
          lon: 1
        }
      })
      .toArray();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}