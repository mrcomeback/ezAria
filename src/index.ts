#!/usr/bin/env node

import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { addAriaAttributesForAll } from './module';

dotenv.config();

const inputPath: string | undefined = process.argv[2];
const outputPath = 'result/output.html';

if (!inputPath) {
  console.error('Error: ez-aria did not find the file <input.html>');
  process.exit(1);
}

console.log(`Processing file: ${inputPath}`);

(async () => {
  const html = fs.readFileSync(inputPath, 'utf-8');
  const result = await addAriaAttributesForAll(html);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result);

  console.log(`ARIA tags inserted into ${outputPath}`);
})();
