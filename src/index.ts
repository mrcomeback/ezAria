import dotenv from 'dotenv';
dotenv.config(); 

import fs from 'fs';
import { addAriaAttributes, addAriaAttributesForAll } from './parser';
const inputPath: string = process.argv[2];
const outputPath: string = "result/output.html";

console.log(`🔍 Processing file: ${inputPath}`);
if (!inputPath) {
    console.error('❌ Error: ez-aria did not find the file <input.html>');
    process.exit(1);
}

(async () => {
    const html = fs.readFileSync(inputPath, 'utf-8');
    const result: string =  await addAriaAttributesForAll(html);
    fs.writeFileSync(outputPath, result);
    console.log(`✅ ARIA tags inserted → ${outputPath}`);
  })();