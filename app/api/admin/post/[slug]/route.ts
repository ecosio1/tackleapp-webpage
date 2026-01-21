import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const postPath = path.join(CONTENT_DIR, `${slug}.json`);

    const data = await fs.readFile(postPath, 'utf-8');
    const post = JSON.parse(data);

    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to load post:', error);
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
}
