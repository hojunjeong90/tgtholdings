import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { join } from 'node:path';

const root = process.cwd();

async function read(relativePath) {
  return readFile(join(root, relativePath), 'utf8');
}

test('exposes the six canonical public routes', async () => {
  const routes = [
    'app/research/page.tsx',
    'app/about-us/page.tsx',
    'app/what-we-do/page.tsx',
    'app/career/page.tsx',
    'app/contact-us/page.tsx',
  ];

  await Promise.all(routes.map((route) => stat(join(root, route))));
});

test('shares the requested navigation labels and URLs', async () => {
  const navigation = await read('lib/constants/navigation.ts');
  const expectedItems = [
    ["href: '/', label: 'Home'"],
    ["href: '/research', label: 'Research'"],
    ["href: '/about-us', label: 'About Us'"],
    ["href: '/what-we-do', label: 'What We Do'"],
    ["href: '/career', label: 'Career'"],
    ["href: '/contact-us', label: 'Contact Us'"],
  ];

  for (const [item] of expectedItems) {
    assert.ok(navigation.includes(item), `missing navigation item: ${item}`);
  }
});

test('shows the menu trigger only below the desktop breakpoint', async () => {
  const header = await read('components/layout/SiteHeader.tsx');

  assert.match(header, /\.sh-hamburger \{ display:none;/);
  assert.match(header, /@media \(max-width:767px\) \{ \.sh-hamburger \{ display:flex; \} \}/);
});

test('applies typography through expression roles rather than heading tags', async () => {
  const [layout, styles, home, career] = await Promise.all([
    read('app/layout.tsx'),
    read('app/globals.css'),
    read('components/landing/FinancialMatrixLanding.tsx'),
    read('components/public/CareerPage.tsx'),
  ]);

  assert.match(layout, /Bricolage_Grotesque/);
  assert.match(layout, /--font-bricolage/);
  assert.match(layout, /--font-geist-sans/);
  assert.match(layout, /--font-geist-mono/);
  assert.match(styles, /font-family:\s*var\(--font-geist-sans\)/);
  assert.match(styles, /\.font-display\s*\{[\s\S]*font-family:\s*var\(--font-bricolage\)/);
  assert.match(styles, /\.label-mono\s*\{[\s\S]*font-family:\s*var\(--font-geist-mono\)/);
  assert.match(styles, /--text-mega:\s*clamp\(3\.5rem, 9vw, 9rem\)/);
  assert.match(styles, /--text-giant:\s*clamp\(2\.75rem, 5\.25vw, 5\.25rem\)/);
  assert.match(styles, /--text-huge:\s*clamp\(2rem, 4vw, 3\.5rem\)/);
  assert.match(styles, /--text-metric:\s*clamp\(3\.25rem, 6\.5vw, 6\.5rem\)/);
  assert.match(styles, /h1,[\s\S]*?text-wrap:\s*balance/);
  assert.match(styles, /p,[\s\S]*?text-wrap:\s*pretty/);
  assert.doesNotMatch(styles, /h1,\s*\n\s*h2,\s*\n\s*h3\s*\{[^}]*font-family/);
  assert.match(home, /className="home-display\b/);
  assert.match(career, /className="career-display\b/);
});

test('uses the restrained section-display scale in the closing block', async () => {
  const closingBlock = await read('components/landing/ClosingBlock.tsx');

  assert.match(closingBlock, /className="font-display text-huge\b/);
  assert.doesNotMatch(closingBlock, /text-mega/);
});

test('keeps former public paths as permanent redirects', async () => {
  const redirects = new Map([
    ['app/ideas/page.tsx', '/research'],
    ['app/who-we-are/page.tsx', '/about-us'],
    ['app/how-we-work/page.tsx', '/what-we-do'],
    ['app/careers/page.tsx', '/career'],
    ['app/contact/page.tsx', '/contact-us'],
  ]);

  for (const [file, destination] of redirects) {
    const source = await read(file);
    assert.match(source, /permanentRedirect/);
    assert.ok(source.includes(`permanentRedirect('${destination}')`));
  }
});
