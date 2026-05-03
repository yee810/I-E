const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-indigo-100 text-indigo-700/g, replacement: 'bg-[#5c9be6]/20 text-[#113a7a]' },
  { regex: /bg-indigo-50 hover:bg-indigo-100/g, replacement: 'bg-[#5c9be6]/10 hover:bg-[#5c9be6]/20' },
  { regex: /bg-indigo-600 hover:bg-indigo-700/g, replacement: 'bg-[#113a7a] hover:bg-[#0d2b5c]' },
  { regex: /bg-indigo-600/g, replacement: 'bg-[#5c9be6]' },
  { regex: /text-indigo-600/g, replacement: 'text-[#5c9be6]' },
  { regex: /text-indigo-700/g, replacement: 'text-[#113a7a]' },
  { regex: /border-indigo-200/g, replacement: 'border-[#5c9be6]/30' },
  { regex: /border-indigo-100/g, replacement: 'border-[#5c9be6]/20' },
  { regex: /focus:border-indigo-600/g, replacement: 'focus:border-[#5c9be6]' },
  { regex: /focus:ring-indigo-600\/20/g, replacement: 'focus:ring-[#5c9be6]/20' },
  { regex: /bg-indigo-50/g, replacement: 'bg-[#5c9be6]/10' },
  { regex: /hover:text-indigo-700/g, replacement: 'hover:text-[#113a7a]' },
  { regex: /hover:border-indigo-500/g, replacement: 'hover:border-[#5c9be6]' },
  { regex: /hover:border-indigo-400/g, replacement: 'hover:border-[#5c9be6]' },
  { regex: /hover:border-indigo-300/g, replacement: 'hover:border-[#5c9be6]/50' },
  { regex: /focus:ring-indigo-500\/20/g, replacement: 'focus:ring-[#5c9be6]/20' },
  { regex: /focus:border-indigo-500/g, replacement: 'focus:border-[#5c9be6]' },
  { regex: /text-indigo-900/g, replacement: 'text-[#113a7a]' },
  { regex: /text-indigo-500/g, replacement: 'text-[#5c9be6]' },
  { regex: /bg-indigo-500/g, replacement: 'bg-[#5c9be6]' },
  { regex: /accent-indigo-600/g, replacement: 'accent-[#5c9be6]' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

const files = [
  'src/screens/ProfileConfirmationScreen.tsx',
  'src/screens/ChatScreen.tsx',
  'src/screens/PreferencesScreen.tsx',
  'src/screens/ProfileInputScreen.tsx',
  'src/screens/LanguageScreen.tsx',
  'src/screens/RegistrationScreen.tsx',
  'src/screens/LandingScreen.tsx',
];

files.forEach(f => processFile(path.join(process.cwd(), f)));
