import { OpenAI } from 'openai';
import path from 'path';
import fs from 'fs';
import { htmlParseAIResult } from './interfaces/htmlParseAIResult';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAriaAttribute(html: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
            {
                role: 'system',
                content: 'You are an accessibility assistant. Respond with only a short string suitable for an aria-label attribute. No explanations, no formatting, no markdown.',
            },
            {
                role: 'user',
                content: `Generate a concise aria-label and role for the following HTML content:\n${html}.For each tag have been processed also need to set an data atribute data-ezaria-handled="true"`,
            },
        ],
        temperature: 0.2,
    });
    return response.choices[0].message.content?.trim() || 'element';
}

function isUrl(src: string): boolean {
    return /^https?:\/\//.test(src);
}

export async function describeImage(src: string): Promise<string> {
    try {
        let imageInput: { type: 'image_url'; image_url: { url: string } };

        if (isUrl(src)) {
            imageInput = {
                type: 'image_url',
                image_url: {
                    url: src,
                },
            };
        } else {
            const absolutePath = path.resolve(src);
            const ext = path.extname(absolutePath).slice(1) || 'jpeg';
            const imageBuffer = fs.readFileSync(absolutePath);
            const base64 = imageBuffer.toString('base64');

            imageInput = {
                type: 'image_url',
                image_url: {
                    url: `data:image/${ext};base64,${base64}`,
                },
            };
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Describe this image briefly for screen readers.' },
                        imageInput,
                    ],
                },
            ],
            max_tokens: 100,
        });
        return response.choices[0].message.content?.trim() || 'Image description';
    } catch (err) {
        console.error('❌ Error describing image:', err);
        return 'Image';
    }
}

// export async function describeEmptyElement(tag: string, styles: string, classes: string): Promise<string> {
//     const response = await openai.chat.completions.create({
//         model: 'gpt-4.1',
//         messages: [
//             {
//                 role: 'system',
//                 content: 'You are an accessibility assistant. Respond with only a short string suitable for an aria-label attribute. No explanations, no formatting, no markdown.',
//             },
//             {
//                 role: 'user',
//                 content: `Generate a concise aria-label for an empty heml element ${tag} with next styles:\n ${styles} and next classes:\n ${classes}".If it is system or rechnical element, set aria-label to "system UI element".
//                 If it is element of design, describe it in a few words.`,
//             },
//         ],
//         temperature: 0.2,
//     });
//     return response.choices[0].message.content?.trim() || 'empty element';
// }

export async function describeHtml(html: string): Promise<htmlParseAIResult[]> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
            {
                role: 'system',
                content: 'You are an accessibility assistant. Respond with a JSON array of objects, each containing "ezariaId", "role", and "ariaLabel" attributes. No explanations, no formatting, no markdown.',
            },
            {
                role: 'user',
                content: `Here is an HTML block. Some elements are already handled and marked with data-ezaria-handled="true".

                Please:
                1. Skip any element that has data-ezaria-handled="true"
                2. For the rest, Generate a concise 'aria-label' and 'role' attributes.
                3. Identify elements using their 'data-ezaria-id' attribute

                Return JSON like:
                [
                {
                    "ezariaId": "ez-005",
                    "role": "region",
                    "ariaLabel": "Disclaimer section"
                },
                ...
                ]
                HTML block:
                ${html}
                "`,
            },
        ],
        temperature: 0.2,
    });
    const raw = response.choices[0].message.content?.trim();

    if (!raw) return [];

    try {
        const parsed: htmlParseAIResult[] = JSON.parse(raw);
        return parsed;
    } catch (err) {
        console.error('❌ Failed to parse AI response as JSON:', raw);
        return [];
    }

}