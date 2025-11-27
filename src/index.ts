#!/usr/bin/env node

import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { addAriaAttributesForAll } from './module';

dotenv.config();

const inputPathArg: string | undefined = process.argv[2];
const outputPathArg: string | undefined = process.argv[3];

if (!inputPathArg) {
  console.error('Error: ez-aria did not find the file <input.html>');
  process.exit(1);
}

const absoluteInputPath = path.resolve(inputPathArg);
const defaultOutputPath = path.resolve(
  'ezaria-result',
  `${path.parse(absoluteInputPath).name}.html`
);
const outputPath = outputPathArg ? path.resolve(outputPathArg) : defaultOutputPath;

console.log(`Processing file: ${absoluteInputPath}`);

(async () => {
  const html = fs.readFileSync(absoluteInputPath, 'utf-8');
  const result = await addAriaAttributesForAll(html);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result);

  console.log(`ARIA tags inserted into ${outputPath}`);
})();
