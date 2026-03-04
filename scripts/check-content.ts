import { blogPosts } from '../lib/blog-data';

for (const p of blogPosts) {
  const t = typeof p.content;
  if (t !== 'string') {
    console.log('NON-STRING content on:', p.slug, t);
  }
}
console.log('Total posts:', blogPosts.length);
console.log('All content fields are strings:', blogPosts.every(p => typeof p.content === 'string'));
