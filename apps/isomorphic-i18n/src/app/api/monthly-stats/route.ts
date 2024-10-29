import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('app');
    const collection = db.collection('monthly_stats');
    
    // Get last 6 months of data for Kenyatta, sorted by date
    const data = await collection
      .find({ 
        landing_site: "kenyatta",
      })
      .sort({ date: -1 })
      .limit(7)  // Get 7 to calculate percentage change
      .toArray();

    // Calculate month-over-month changes and format data
    const stats = {
      submissions: {
        current: data[0].tot_submissions,
        percentage: calculatePercentageChange(data[0].tot_submissions, data[1].tot_submissions),
        trend: data.slice(0, 6).map(d => ({
          day: new Date(d.date).toLocaleString('default', { month: 'short' }),
          sale: d.tot_submissions
        })).reverse()
      },
      fishers: {
        current: data[0].tot_fishers,
        percentage: calculatePercentageChange(data[0].tot_fishers, data[1].tot_fishers),
        trend: data.slice(0, 6).map(d => ({
          day: new Date(d.date).toLocaleString('default', { month: 'short' }),
          sale: d.tot_fishers
        })).reverse()
      },
      catches: {
        current: data[0].tot_catches,
        percentage: calculatePercentageChange(data[0].tot_catches, data[1].tot_catches),
        trend: data.slice(0, 6).map(d => ({
          day: new Date(d.date).toLocaleString('default', { month: 'short' }),
          sale: d.tot_catches
        })).reverse()
      },
      weight: {
        current: data[0].tot_kg,
        percentage: calculatePercentageChange(data[0].tot_kg, data[1].tot_kg),
        trend: data.slice(0, 6).map(d => ({
          day: new Date(d.date).toLocaleString('default', { month: 'short' }),
          sale: d.tot_kg
        })).reverse()
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function calculatePercentageChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Number(((current - previous) / previous * 100).toFixed(2));
}