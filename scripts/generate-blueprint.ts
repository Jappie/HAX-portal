import fs from 'node:fs';

const inputPath = process.argv[2] || 'blueprint.md';
const outputPath = process.argv[3] || 'blueprint.js';

if (!fs.existsSync(inputPath)) {
  console.log(`ℹ️  No ${inputPath} found, creating a dummy one for demonstration.`);
  fs.writeFileSync(inputPath, `# Applicatie Blueprint.

\`\`\`mermaid
erDiagram
    Dashboard {
        string menuName "Dashboard"
        boolean isFavorite true
        string roles "all"
    }
    Customers {
        integer id "PK"
        string name "required"
        string menuName "Klanten"
        string roles "admin,sales,guest"
    }
\`\`\`
`);
}

const markdown = fs.readFileSync(inputPath, 'utf8');
const tableRegex = /(\w+)\s*\{\s*([\s\S]*?)\}/g;
const appConfig: Record<string, any> = {};

let match;
while ((match = tableRegex.exec(markdown)) !== null) {
  const tableName = match[1];
  const propertiesRaw = match[2].split('\n');
  
  appConfig[tableName] = {};

  propertiesRaw.forEach(line => {
    const metaMatch = line.match(/(\w+)\s+"?([^"\n]+)"?/);
    if (metaMatch) {
      const key = metaMatch[1];
      let value: any = metaMatch[2];
      
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      appConfig[tableName][key] = value;
    }
  });
}

const outputCode = `// GEGENEREERD - NIET HANDMATIG WIJZIGEN\nexport const appConfig = ${JSON.stringify(appConfig, null, 2)};`;
fs.writeFileSync(outputPath, outputCode);
console.log(`✅ ${outputPath} generated from ${inputPath}!`);
