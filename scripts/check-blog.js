const fs = require('fs');
const content = fs.readFileSync('lib/blog-data.ts', 'utf8');

console.log('File length:', content.length, 'chars');
console.log('File lines:', content.split('\n').length);

const posts = content.match(/slug: "[^"]+"/g);
console.log('Total posts found:', posts?.length);

const targets = [
  'rag-is-dead-vector-databases-waste-of-money',
  'langchain-considered-harmful',
  'agents-are-all-you-need',
  'ai-code-generation-killing-junior-devs',
  'great-ai-hiring-scam',
];

for (const slug of targets) {
  const slugIdx = content.indexOf('slug: "' + slug + '"');
  const contentStart = content.indexOf('content: `', slugIdx);
  const contentEnd = content.indexOf('\n`,', contentStart + 10);
  if (contentEnd === -1) {
    console.log(slug + ': CONTENT END NOT FOUND');
    continue;
  }
  const postContent = content.substring(contentStart + 10, contentEnd);
  const stripped = postContent
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`>|\-\[\]()]/g, '')
    .trim();
  const words = stripped.split(/\s+/).filter(Boolean).length;
  console.log(slug + ': ~' + words + ' words');
}
