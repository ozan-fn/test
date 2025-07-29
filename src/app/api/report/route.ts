import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const VALID_API_KEY = '1234567890';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get('apikey');

    if (apiKey !== VALID_API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const body = await req.json();
    const {
      battery_percent,
      battery_voltage,
      signal,
      provider
    } = body;

    if (battery_percent == null || battery_voltage == null || signal == null || !provider) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await prisma.report.create({
      data: {
        battery_percent,
        battery_voltage,
        signal,
        provider
      }
    });

    return NextResponse.json({ message: 'Data saved successfully', data: body });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
