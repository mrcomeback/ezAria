import * as cheerio from 'cheerio';
import { generateAriaAttribute, describeImage} from './ai';

export async function addAriaAttributes(html: string): Promise<string> {
  const $ = cheerio.load(html);
  console.log($);
  const promises: Promise<void>[] = [];

  $('a, button').each((_, el) => {
    const $el = $(el);
    if (!$el.attr('aria-label')) {
      const text = $el.text().trim();
      const htmlSnippet = $.html(el);

      const p = generateAriaAttribute(htmlSnippet).then((ariaLabel) => {
        $el.attr('aria-label', ariaLabel);
      });

      promises.push(p);
    }
  });

  await Promise.all(promises);
  return $.html();
}

export async function addAriaAttributesForAll(html: string): Promise<string> {
  const $ = cheerio.load(html);

  const tagsToProcess = ['a', 'button', 'p', 'h1', 'h2', 'h3', 'li'];
  const imgElements = $('img');

  // Handle image tags with describeImage()
  for (const el of imgElements.toArray()) {
    const $el = $(el);
    if (!$el.attr('aria-label') && $el.attr('src')) {
      const label = await describeImage($el.attr('src')!);
      $el.attr('aria-label', label);
    }
  }

  // Handle other common tags with generateAriaAttribute()
  for (const tag of tagsToProcess) {
    const elements = $(tag);

    for (const el of elements.toArray()) {
      const $el = $(el);
      if (!$el.attr('aria-label')) {
        const content = $el.text().trim();
        if (content) {
          const label = await generateAriaAttribute(content);
          $el.attr('aria-label', label);
        }
      }
    }
  }

  return $.html();
}
