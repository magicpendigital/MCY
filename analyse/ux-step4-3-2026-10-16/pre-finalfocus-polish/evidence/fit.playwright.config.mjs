import base from './qa.playwright.config.mjs';import path from 'node:path';
export default {...base,workers:1,grep:/short second check-in step/,reporter:[['list'],['json',{outputFile:path.join(import.meta.dirname,'fit-results.json')}]],outputDir:path.join(import.meta.dirname,'fit-test-results')};
