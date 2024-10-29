import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('app');
    const collection = db.collection('gear_distribution');
    
    const data = await collection.find({}, {
      projection: {
        _id: 0,
        landing_site: 1,
        gear: 1,
        gear_n: 1,
        gear_perc: 1
      }
    }).toArray();

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