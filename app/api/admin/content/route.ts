import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const INDEX_PATH = path.join(CONTENT_DIR, '_system', 'contentIndex.json');

// GET - Load all content
export async function GET() {
  try {
    const indexData = await fs.readFile(INDEX_PATH, 'utf-8');
    const index = JSON.parse(indexData);
    // Map blogPosts to blog for the admin UI
    return NextResponse.json({
      blog: index.blogPosts || [],
      species: index.species || [],
      howTo: index.howTo || [],
      locations: index.locations || [],
    });
  } catch (error) {
    console.error('Failed to load content index:', error);
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
}

// POST - Save a blog post
export async function POST(request: NextRequest) {
  try {
    const { post } = await request.json();

    if (!post || !post.slug) {
      return NextResponse.json({ error: 'Invalid post data' }, { status: 400 });
    }

    // Load the individual blog post file
    const postPath = path.join(CONTENT_DIR, 'blog', `${post.slug}.json`);

    let existingPost: Record<string, unknown> = {};
    try {
      const existingData = await fs.readFile(postPath, 'utf-8');
      existingPost = JSON.parse(existingData);
    } catch {
      // Post file doesn't exist yet, that's okay
    }

    // Merge the updates with existing data
    const updatedPost = {
      ...existingPost,
      title: post.title,
      description: post.description,
      category: post.category,
      publishedAt: post.publishedAt,
      heroImage: post.heroImage || existingPost.heroImage,
      videoUrl: post.videoUrl || undefined,
      body: post.body !== undefined ? post.body : existingPost.body,
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined values
    (Object.keys(updatedPost) as Array<keyof typeof updatedPost>).forEach(key => {
      if (updatedPost[key] === undefined) {
        delete updatedPost[key];
      }
    });

    // Save the post file
    await fs.writeFile(postPath, JSON.stringify(updatedPost, null, 2));

    // Update the content index
    const indexData = await fs.readFile(INDEX_PATH, 'utf-8');
    const index = JSON.parse(indexData);

    // Use blogPosts (the actual key in the content index)
    const blogIndex = index.blogPosts?.findIndex((p: { slug: string }) => p.slug === post.slug);
    if (blogIndex !== undefined && blogIndex >= 0) {
      index.blogPosts[blogIndex] = {
        ...index.blogPosts[blogIndex],
        title: post.title,
        description: post.description,
        category: post.category,
        publishedAt: post.publishedAt,
        heroImage: post.heroImage || index.blogPosts[blogIndex].heroImage,
        videoUrl: post.videoUrl || undefined,
      };

      // Remove undefined values from index entry
      Object.keys(index.blogPosts[blogIndex]).forEach(key => {
        if (index.blogPosts[blogIndex][key] === undefined) {
          delete index.blogPosts[blogIndex][key];
        }
      });

      // Update lastUpdated timestamp
      index.lastUpdated = new Date().toISOString();

      await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save post:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}
