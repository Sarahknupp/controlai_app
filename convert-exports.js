import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of components to convert
const components = [
  'src/pages/Dashboard.tsx',
  'src/pages/auth/Login.tsx',
  'src/pages/products/Products.tsx',
  'src/pages/inventory/Inventory.tsx',
  'src/pages/production/Production.tsx',
  'src/pages/production/KitchenProduction.tsx',
  'src/pages/production/ConfectioneryProduction.tsx',
  'src/pages/production/BakeryProduction.tsx',
  'src/pages/production/ProductionOrder.tsx',
  'src/pages/pos/POS.tsx',
  'src/pages/reports/Reports.tsx',
  'src/pages/accounting/AccountingModule.tsx',
  'src/pages/accounting/AccountantDashboard.tsx',
  'src/pages/accounting/FiscalIntegration.tsx',
  'src/pages/accounting/SpedGeneration.tsx',
  'src/pages/accounting/NFeManagement.tsx',
  'src/pages/accounting/CompanyManagement.tsx',
  'src/pages/accounting/EntityRegistration.tsx',
  'src/pages/settings/UserSettingsPage.tsx',
  'src/pages/settings/SystemCustomizationPage.tsx'
];

// Function to convert named export to default export
function convertToDefaultExport(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Get the component name from the file path
    const componentName = path.basename(filePath, '.tsx');
    
    // Replace named export with default export
    content = content.replace(
      new RegExp(`export const ${componentName}`),
      `const ${componentName}`
    );
    
    // Add default export at the end if it doesn't exist
    if (!content.includes('export default')) {
      content += `\nexport default ${componentName};\n`;
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`Converted ${filePath} to use default export`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Convert all components
components.forEach(convertToDefaultExport); 