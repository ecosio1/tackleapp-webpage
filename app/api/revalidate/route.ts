/**
 * Revalidation API route
 */

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check secret token
    const authHeader = request.headers.get('authorization');
    const secret = process.env.REVALIDATION_SECRET || process.env.REVALIDATE_SECRET;
    
    if (!secret) {
      return NextResponse.json(
        { error: 'Revalidation secret not configured' },
        { status: 500 }
      );
    }
    
    // Check token
    const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('secret');
    if (token !== secret) {
      return NextResponse.json(
        { error: 'Invalid secret token' },
        { status: 401 }
      );
    }
    
    // Get paths to revalidate
    const body = await request.json();
    const { paths } = body;
    
    if (!Array.isArray(paths)) {
      return NextResponse.json(
        { error: 'Paths must be an array' },
        { status: 400 }
      );
    }
    
    // Revalidate each path
    for (const path of paths) {
      revalidatePath(path);
    }
    
    // Also revalidate sitemap
    revalidatePath('/sitemap.xml');
    
    return NextResponse.json({
      revalidated: true,
      paths,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}



