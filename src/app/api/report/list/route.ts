import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.report.count()
    ]);

    return NextResponse.json({
      data: reports,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal ambil data' }, { status: 500 });
  }
}
