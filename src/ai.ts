import { OpenAI } from 'openai';
import path from 'path';
import fs from 'fs';

const openai = new OpenAI({ apiKey:  process.env.OPENAI_API_KEY });

export async function generateAriaAttribute(text: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
            {
              role: 'system',
              content: 'You are an accessibility assistant. Respond with only a short string suitable for an aria-label attribute. No explanations, no formatting, no markdown.',
            },
            {
              role: 'user',
              content: `Generate a concise aria-label for the following HTML content:\n"${text}"`,
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
        console.log(response);
        console.log(response.choices[0]);
        return response.choices[0].message.content?.trim() || 'Image description';
    } catch (err) {
        console.error('❌ Error describing image:', err);
        return 'Image';
    }
}
