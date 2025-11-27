import path from 'path';
import fs from 'fs';
import { htmlParseAIResult } from './interfaces/htmlParseAIResult';

const BASIC_HTML_ENTITIES: Record<string, string> = {
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
};

function decodeBasicEntities(value: string): string {
    let decoded = value;

    for (const [entity, replacement] of Object.entries(BASIC_HTML_ENTITIES)) {
        decoded = decoded.replace(new RegExp(entity, 'g'), replacement);
    }

    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match: string, hex: string) => {
        const codePoint = parseInt(hex, 16);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    });

    decoded = decoded.replace(/&#(\d+);/g, (match: string, num: string) => {
        const codePoint = parseInt(num, 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    });

    return decoded;
}

function sanitizeAriaText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const withoutTags = value.replace(/<[^>]*>/g, ' ');
    const decoded = decodeBasicEntities(withoutTags);
    const normalized = decoded.replace(/\s+/g, ' ').trim();

    return normalized || undefined;
}

export async function generateAriaAttribute(html: string): Promise<string> {
    try {
        const response = await fetch('https://ez-aria-fa.azurewebsites.net/api/generateAriaAttribute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ html }),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const raw = await response.text();

        if (!raw) {
            return 'element';
        }

        try {
            const data = JSON.parse(raw);

            if (typeof data === 'string') {
                return sanitizeAriaText(data) ?? 'element';
            }

            if (data && typeof data.ariaLabel === 'string') {
                return sanitizeAriaText(data.ariaLabel) ?? 'element';
            }

            if (data && typeof data.label === 'string') {
                return sanitizeAriaText(data.label) ?? 'element';
            }
        } catch {
            return sanitizeAriaText(raw) ?? 'element';
        }

        return 'element';
    } catch (error) {
        console.error('Error generating ARIA attribute:', error);
        return 'element';
    }
}

function isUrl(src: string): boolean {
    return /^https?:\/\//.test(src);
}

export async function describeImage(src: string): Promise<string> {
    try {
        let payloadSrc = src;

        if (!isUrl(src)) {
            const absolutePath = path.resolve(src);
            const ext = path.extname(absolutePath).slice(1) || 'jpeg';
            const imageBuffer = fs.readFileSync(absolutePath);
            const base64 = imageBuffer.toString('base64');
            payloadSrc = `data:image/${ext};base64,${base64}`;
        }

        const response = await fetch('https://ez-aria-fa.azurewebsites.net/api/describeImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ src: payloadSrc }),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const raw = await response.text();

        if (!raw) {
            return 'Image description';
        }

        try {
            const data = JSON.parse(raw);

            if (typeof data === 'string') {
                return sanitizeAriaText(data) ?? 'Image description';
            }

            if (data && typeof data.description === 'string') {
                return sanitizeAriaText(data.description) ?? 'Image description';
            }

            if (data && typeof data.ariaLabel === 'string') {
                return sanitizeAriaText(data.ariaLabel) ?? 'Image description';
            }
        } catch {
            return sanitizeAriaText(raw) ?? 'Image description';
        }

        return 'Image description';
    } catch (err) {
        console.error('Error describing image via API:', err);
        return 'Image';
    }
}

export async function describeHtml(html: string): Promise<htmlParseAIResult[]> {
    try {
        const response = await fetch('https://ez-aria-fa.azurewebsites.net/api/describeHtml', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ html }),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const raw = await response.text();

        if (!raw) {
            return [];
        }

        try {
            const parsed: unknown = JSON.parse(raw);

            if (Array.isArray(parsed)) {
                return (parsed as htmlParseAIResult[]).map((item) => ({
                    ...item,
                    ariaLabel: sanitizeAriaText(item.ariaLabel),
                }));
            }

            console.error('Unexpected describeHtml response shape:', parsed);
            return [];
        } catch {
            console.error('Failed to parse describeHtml response as JSON:', raw);
            return [];
        }
    } catch (err) {
        console.error('Error describing HTML via API:', err);
        return [];
    }
}
