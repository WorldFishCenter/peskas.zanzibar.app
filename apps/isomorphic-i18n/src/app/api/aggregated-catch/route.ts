import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/mongodb';

export async function GET(req: NextRequest) {
    try {
      const client = await clientPromise;
      const db = client.db('kenya');
      const collection = db.collection('legacy_data');
      
      // Filter and aggregate data
      const data = await collection.aggregate([
        {
          $match: {
            landing_site: "Kenyatta"
          }
        },
        {
          $project: {
            landing_date: {
              $dateTrunc: {
                date: "$landing_date",
                unit: "month"
              }
            },
            fish_category: 1,
            catch_kg: 1
          }
        },
        {
          $group: {
            _id: {
              landing_date: "$landing_date",
              fish_category: "$fish_category"
            },
            catch_kg: { $sum: "$catch_kg" }
          }
        },
        {
          $sort: { "_id.landing_date": 1, "_id.fish_category": 1 }
        }
      ]).toArray();
  
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching data:', (error as Error).message);
      return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
    }
  }