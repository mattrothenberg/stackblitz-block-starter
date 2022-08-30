import sdk, { VM } from "@stackblitz/sdk";
import { useEffect, useRef } from "react";

const pkgJson = `
  {
    "name": "my-project",
    "scripts": {
      "start": "start-storybook -p 4123"
    },
    "dependencies": {
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
      "twind": "latest"
    },
    "devDependencies": {
      "@types/react": "^17.0.33",
      "@types/react-dom": "^17.0.10",
      "typescript": "^4.5.4",
      "@babel/core": "^7.18.13",
      "babel-loader": "^8.2.5",
      "@storybook/addon-essentials": "^6.5.10",
      "@storybook/react": "^6.5.10"
    },
    "stackblitz": {
      "installDependencies": true,
      "startCommand": "npm start"
    }
  }
`;

const componentSrc = `
import { tw } from 'twind'
import { ReactNode } from 'react'

export interface ButtonProps {
  appearance?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
}

function Button ({appearance = "primary", disabled = false, loading = false, children = '' }: ButtonProps) {
  let buttonClass = tw(["px-3 py-1.5 font-medium rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed", { 'bg-blue-600 text-white border-blue-600': appearance === "primary", 'bg-gray-200 border-gray-200 text-gray-900': appearance === "secondary", 'bg-white text-black': appearance === "tertiary" }]);

  return (
    <button disabled={disabled || loading} className={buttonClass}>
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button;
`;

const componentStorySrc = `
import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Component from './component';

export default {
  title: 'Component',
  component: Component,
} as ComponentMeta<typeof Component>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Component> = (args) => <Component {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: ""
}
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

const storybookMainSrc = `
module.exports = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
  ],
  "framework": "@storybook/react",
  features: {
    postcss: false,
  },
}
`;

const previewHeadSrc = `
<script>
  window.global = window;
</script>
`;

const storybookPreviewSrc = `
export const parameters = {
  layout: 'centered',
};
`;

const storybookManagerSrc = `
import { addons } from '@storybook/addons';

addons.setConfig({
  isFullscreen: false,
  showNav: false,
  showPanel: true,
  panelPosition: 'bottom',
  enableShortcuts: false,
  showToolbar: true,
  selectedPanel: undefined,
  initialActive: 'sidebar',
  sidebar: {
    showRoots: false,
    collapsedRoots: ['other'],
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});

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
            ".storybook/main.cjs": storybookMainSrc,
            ".storybook/preview-head.html": previewHeadSrc,
            ".storybook/preview.cjs": storybookPreviewSrc,
            ".storybook/manager.js": storybookManagerSrc,
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
          view: "preview",
          hideExplorer: true,
          hideNavigation: true,
          hideDevTools: true,
        }
      );
    };

    initStackblitz();
  });
  return <div id="embed">Hello</div>;
}

export default App;
