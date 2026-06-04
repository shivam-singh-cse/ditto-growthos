const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function rmDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        rmDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

['app', 'components', 'lib', 'types'].forEach(d => rmDir(path.join(srcDir, d)));

['app', 'components', 'lib', 'types', 'components/layout', 'components/ui'].forEach(d => fs.mkdirSync(path.join(srcDir, d), { recursive: true }));

// Recreate app/layout.tsx
fs.writeFileSync(path.join(srcDir, 'app', 'layout.tsx'), `import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ditto OS",
  description: "Influencer Marketing OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--color-surface-strong)] text-[var(--color-text-tertiary)]">
        {children}
      </body>
    </html>
  );
}
`);

// Recreate app/globals.css
fs.writeFileSync(path.join(srcDir, 'app', 'globals.css'), `@import "tailwindcss";

@theme {
  --color-surface-base: #000000;
  --color-text-secondary: #51636f;
  --color-text-tertiary: #191f23;
  --color-text-inverse: #ffffff;
  --color-surface-raised: #ecede9;
  --color-surface-strong: #f7f8f9;
  --color-border-default: #e4e4e7;
  --color-border-muted: #a1a1aa;
}

@layer base {
  :root {
    --color-surface-base: #000000;
    --color-text-secondary: #51636f;
    --color-text-tertiary: #191f23;
    --color-text-inverse: #ffffff;
    --color-surface-raised: #ecede9;
    --color-surface-strong: #f7f8f9;
    --color-border-default: #e4e4e7;
    --color-border-muted: #a1a1aa;
  }
}
`);

console.log("Scaffold complete.");
