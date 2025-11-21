import * as cheerio from 'cheerio';
import { generateAriaAttribute, describeImage, describeHtml } from './ai';
import { AMBIGUOUS_TAGS, DEFAULT_TAGS } from './constants';
import { CheerioAPI } from 'cheerio';
import { htmlParseAIResult } from './interfaces/htmlParseAIResult';

export async function addAriaAttributes(html: string): Promise<string> {
  const $ = cheerio.load(html);
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
  const $: CheerioAPI = cheerio.load(html);
  assignEzariaIdsToAllElements($);

  const imgElements = $('img');

  // Handle image tags with describeImage()
  console.log(`🔍 Found ${imgElements.length} image elements to process.`);
  console.log(`🧠 Processing images for alt text...`);
  for (const [i, el] of imgElements.toArray().entries()) {
    process.stdout.write(`🖼️  Processing image ${i}/${imgElements.length}...\r`);
    const $el = $(el);
    if (!$el.attr('aria-label') && $el.attr('src')) {
      const label = await describeImage($el.attr('src')!);
      $el.attr('aria-label', label);
    }
  }
  console.log(`\n✅ Image processing complete.`);


  // Handle common tags with generateAriaAttribute()
  const stopDefaultTagsAnimation = startDotsAnimation('🧠 Processing default tags for ARIA attributes');
  for (const tag of DEFAULT_TAGS) {
    const elements = $(tag);
    for (const el of elements.toArray()) {
      const $el = $(el);
      if (!$el.attr('aria-label')) {
        const content = $el.text().trim();
        if (content) {
          const label = await generateAriaAttribute(content);
          $el.attr('aria-label', label);
          $el.attr('data-ezaria-handled', 'true');
        }
      }
    }
  }
  stopDefaultTagsAnimation();
  console.log(`\n✅ Default tags processing complete.`);

  const stopAmbigiusTagsAnimation = startDotsAnimation('🧠 Processing ambiguous tags for ARIA attributes');
  const result: htmlParseAIResult[] = await describeHtml($.html())
  applyEzAriaSuggestions($, result);
  stopAmbigiusTagsAnimation();
  console.log(`✅ Ambiguous tag processing complete.`);

  return $.html();
}


function assignEzariaIdsToAllElements(
  $: CheerioAPI,
  startIndex = 1
): void {
  let counter = startIndex;

  $('*').each((_, el) => {
    const $el = $(el);

    $el.attr('data-ezaria-id', `ez-${counter.toString().padStart(4, '0')}`);
    counter++;
  });
}

function applyEzAriaSuggestions(
  $: CheerioAPI,
  suggestions: htmlParseAIResult[]
): void {
  for (const suggestion of suggestions) {
    const selector = `[data-ezaria-id="${suggestion.ezariaId}"]`;
    const $el = $(selector);

    if ($el.length === 0) continue;

    if (suggestion.role) {
      $el.attr('role', suggestion.role);
    }

    if (suggestion.ariaLabel) {
      $el.attr('aria-label', suggestion.ariaLabel);
    }

    $el.attr('data-ezaria-handled', 'true');
  }

  // 🧹 Cleanup: remove all data-ezaria-id attributes
  $('[data-ezaria-id]').removeAttr('data-ezaria-id').removeAttr('data-ezaria-handled');
}

function startDotsAnimation(label: string): () => void {
  const states = ['.', '..', '...'];
  let i = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r${label}${states[i % states.length]}   `); // extra space to clear
    i++;
  }, 500); // update every 500ms

  // Return a stop function
  return () => {
    clearInterval(interval);
    process.stdout.write('\r'); // clear line
  };
}