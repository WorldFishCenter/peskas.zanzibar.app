import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('app');
    const collection = db.collection('catch_monthly');
    
    // Log basic collection info
    const count = await collection.countDocuments();
    console.log(`Total documents in catch_monthly: ${count}`);
    
    // Try to get a sample document to verify structure
    const sampleDoc = await collection.findOne({});
    console.log('Sample document:', sampleDoc);
    
    // First let's check what BMUs we have
    const bmuList = await collection.distinct('BMU');
    console.log('Available BMUs:', bmuList);
    
    const data = await collection.aggregate([
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
    ]).toArray();

    console.log('Query results:', data);
    console.log('Number of records:', data.length);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Detailed Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}