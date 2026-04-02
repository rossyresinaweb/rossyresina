const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const blogPath = path.join(process.cwd(), 'src', 'data', 'blog.json');
  const posts = JSON.parse(fs.readFileSync(blogPath, 'utf-8'));

  for (const post of posts) {
    const slug = String(post.slug || post.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: post.title || '',
        author: post.author || 'Rossy',
        date: post.date || new Date().toISOString().slice(0, 10),
        excerpt: post.excerpt || '',
        content: Array.isArray(post.content) ? post.content : [],
        image: post.image || '',
        comments: Number(post.comments || 0),
      },
    });
    console.log(`Migrado: ${slug}`);
  }
  console.log('Blog migrado a la BD.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
