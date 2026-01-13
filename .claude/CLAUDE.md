# Tackle App Webpage - Claude Code Instructions

## 📝 Content Guidelines

When working with blog posts, ALWAYS reference:
- **Full Guidelines**: `.claude/blog-content-guidelines.md` - Complete retention and SEO strategy
- **Quick Checklist**: `.claude/blog-checklist.md` - Pre-publish verification

These contain the 12-section post structure, image requirements, and retention best practices.

---

## Project Structure

This is a Next.js 14 application for the Tackle fishing app landing page and blog.

### Key Directories:
- `/app` - Next.js app directory (pages, layouts)
- `/components` - Reusable React components
- `/content` - JSON content files for blog posts
- `/lib` - Utility functions and helpers
- `/public` - Static assets (images, videos)

### Content System:
- Blog posts are stored as JSON in `/content/blog/`
- Content index at `/content/_system/contentIndex.json`
- Each post includes metadata, body (markdown), FAQs, sources

---

## Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Important Notes

- Images use Next.js Image component for optimization
- External images from Unsplash are pre-configured
- Blog posts render markdown with React Markdown
- SEO schemas included (Article, FAQ, Breadcrumb, Author)
