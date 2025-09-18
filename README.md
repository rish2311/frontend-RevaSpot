## Project Structure

The project is organized as follows:

- **/public**: Contains static image assets
- **/src**
  - **components**: Reusable React components
    - **custom**: Custom UI components like buttons and loaders
    - **layouts**: Layout components for different pages
    - **ui**: UI components like cards, dialogs, etc.
  - **routes**: Routes and the respective route components for different pages
    - **__root.tsx**: Main component for layout structure and conditional rendering.
  - **services**: API service functions
  - **tailwind.config.js**: Global Tailwind styles and variables configuration
  - **eslint.config.js**: ESLint configuration
  - **main.tsx**: Entry point for the React application
  - **index.css**: Main CSS file

## Project setup

**Install dependencies**

`npm install`

**Start the development server**  

`npm run dev`

**Build the project for production**  

`npm run build`

**Preview the production build**  

`npm run preview`


## Features

### Non-CRM integrated clients

- **Enrichment tab:** Single + bulk enrichment (with progress tracking and capability to download)
- **Leads tab:** Explore leads (with filters on derived variables, date, files and segments and column configuration)
- **Dashboard tab:** Analyze lead distribution - critical numbers, derived variables chart (with filters on date, files and segments)
- **Segments tab:** 
  - View list of all segments
  - Create/edit a segment [Not available in v0, do directly in backend on customer request]
  - View a segment definition and critical numbers - coverage only (with filters on date, files). 
  - Explore leads button that pre-applies selected filters - selected segment, date and files and redirects to leads tab.

### CRM integrated clients

All the features in Non-CRM integrated clients along with:
- **Dashboard tab:** Analyze lead distribution - Week-on-week performance chart.
- **Segments tab:** View critical numbers (qualification and conversion) and Week-on-Week peformance chart.

### Admin

- **Enrichment tab:** bulk email validation, phone validation, linkedin to email and linkedin to phone (with progress tracking and capability to download)

__NOTE__: The client state would be decided based on output from getClientState (/auth/me api)


## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

