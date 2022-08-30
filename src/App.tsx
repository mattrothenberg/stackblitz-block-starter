import { useState, useEffect, useRef } from "react";
import sdk, { VM } from "@stackblitz/sdk";

const pkgJson = `
  {
    "name": "my-project",
    "scripts": {
      "start": "ladle serve --port 4123",
      "build": "ladle build"
    },
    "dependencies": {
      "@ladle/react": "^2.3.0",
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
      "react-docgen": "latest",
      "twind": "latest"
    },
    "devDependencies": {
      "@types/react": "^17.0.33",
      "@types/react-dom": "^17.0.10",
      "typescript": "^4.5.4"
    },
    "stackblitz": {
      "installDependencies": true,
      "startCommand": "react-docgen src/component.tsx --pretty --out src/docs.json && npm start"
    }
  }
`;

const componentSrc = `
import { tw } from 'twind'

interface ButtonProps {
  appearance?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
}

const Button = ({appearance = "primary", disabled = false }: ButtonProps) => {
  let buttonClass = tw(["px-3 py-1.5 border text-sm disabled:opacity-50 disabled:cursor-not-allowed", { 'bg-blue-600 text-white border-blue-600': appearance === "primary", 'bg-gray-600 border-gray-600 text-black': appearance === "secondary", 'bg-white text-black': appearance === "tertiary" }]);

  return (
    <button disabled={disabled} className={buttonClass}>Press Me</button>
  )
}

export default Button;
`;

const componentStorySrc = `
import type { Story } from '@ladle/react';
import docs from "./docs.json"
import Component  from "./component.tsx"

export const Controls: Story = (props) => {
  return (
    <>
     <Component {...props} />
    </>
  )
};

Controls.argTypes = Object.keys(docs.props).reduce((acc, propName) => {
  let match = docs.props[propName]

  switch (match.tsType.name) {
    case "union":
      acc[propName] = {
        options: match.tsType.elements.map(e => e.value.replaceAll('"', '')),
        control: { type: 'select' }
      }
      break;
    case "boolean":
      acc[propName] = {
        control: {type: 'checkbox'},
        options: ["true", "false"],
        defaultValue: "false",
      }
      break;
    default:
      break;
  }

  return acc;
}, {})

Controls.storyName = "Story";



`;

const tsConfigSrc = `
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "."
  ]
}
`;

function App() {
  const vmRef = useRef<VM>(null!);
  useEffect(() => {
    if (vmRef.current) return;

    const initStackblitz = async () => {
      vmRef.current = await sdk.embedProject(
        "embed",
        {
          title: "Faux-storybook",
          description: "A storybook clone built with Ladle",
          template: "node",
          files: {
            "src/component.tsx": componentSrc,
            "src/index.stories.tsx": componentStorySrc,
            "package.json": pkgJson,
            "tsconfig.json": tsConfigSrc,
          },
        },
        {
          height: "100%",
          clickToLoad: false,
          theme: "light",
          openFile: "src/component.tsx",
          terminalHeight: 0,
        }
      );
    };

    initStackblitz();
  });
  return <div id="embed">Hello</div>;
}

export default App;
