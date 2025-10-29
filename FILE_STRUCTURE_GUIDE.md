# MARC Export - File Structure & Installation Guide

## 📁 Correct File Structure

Place the files in your project according to this structure:

```
your-project/
├── src/
│   ├── utils/
│   │   ├── MARCExporter.ts           ← Core MARC export logic
│   │   ├── BatchMARCExporter.ts      ← Batch operations
│   │   └── MARCExportExamples-fixed.ts  ← Usage examples (optional)
│   │
│   ├── catalog/
│   │   └── components/
│   │       └── MARCExportButton.tsx   ← React export button component
│   │
│   └── firebase/
│       └── config.ts                  ← Your existing Firebase config
│
├── package.json
└── tsconfig.json
```

## 🔧 Fixed Issues

The following issues have been corrected:

### 1. ✅ Import Path Fixed
**MARCExportButton.tsx** now uses the correct relative path:
```typescript
// Changed from:
import { MARCExporter } from '../utils/MARCExporter';

// To:
import { MARCExporter } from '../../utils/MARCExporter';
```

### 2. ✅ JSX Style Tag Fixed
Removed Next.js-specific `<style jsx>` and replaced with standard `<style>` tag:
```typescript
// Changed from:
<style jsx>{`...`}</style>

// To:
<style>{`...`}</style>
```

### 3. ✅ TypeScript Interface Fixed
Added missing properties to **BatchMARCExporter.ts**:
```typescript
interface CatalogRecord {
  id?: string;
  title?: string;
  author?: string;
  isbn?: string;        // ← Added
  subjects?: string[];  // ← Added
  // ... other fields
}
```

### 4. ✅ Examples File Fixed
Created **MARCExportExamples-fixed.ts** with:
- Proper TypeScript types
- Commented JSX code to avoid compilation errors
- Correct import paths

## 📦 Installation Steps

### Step 1: Copy Files

Copy the files to your project structure as shown above:

```bash
# From your download directory
cp MARCExporter.ts your-project/src/utils/
cp BatchMARCExporter.ts your-project/src/utils/
cp MARCExportButton.tsx your-project/src/catalog/components/
cp MARCExportExamples-fixed.ts your-project/src/utils/ # (optional)
```

### Step 2: Verify Import Paths

If your file structure is different, adjust the import in **MARCExportButton.tsx**:

```typescript
// If your structure is:
// src/
//   components/
//     MARCExportButton.tsx
//   utils/
//     MARCExporter.ts

// Use:
import { MARCExporter } from '../utils/MARCExporter';

// If your structure is:
// src/
//   catalog/
//     components/
//       MARCExportButton.tsx
//   utils/
//     MARCExporter.ts

// Use:
import { MARCExporter } from '../../utils/MARCExporter';
```

### Step 3: Update Your Components

Add the MARC export button to your catalog detail page:

```typescript
// In your CatalogItemDetail.tsx or similar
import MARCExportButton from './components/MARCExportButton';
// OR if in different location:
import MARCExportButton from '../catalog/components/MARCExportButton';

function CatalogItemDetail({ item }) {
  return (
    <div>
      <h1>{item.title}</h1>
      {/* Your existing content */}
      
      <MARCExportButton 
        record={item} 
        recordId={item.id} 
      />
    </div>
  );
}
```

## 🔍 Alternative: Use CSS Modules (Optional)

If you prefer CSS Modules instead of inline styles, create:

**MARCExportButton.module.css**:
```css
.marcExportContainer {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background: #f9f9f9;
}

/* ... rest of styles ... */
```

Then update **MARCExportButton.tsx**:
```typescript
import styles from './MARCExportButton.module.css';

// Replace className="marc-export-container" with:
className={styles.marcExportContainer}
```

## 🧪 Testing Your Installation

### Test 1: Component Compiles
```bash
npm run build
# or
yarn build
```

Should complete without errors.

### Test 2: Export Single Record
```typescript
import { MARCExporter } from './utils/MARCExporter';

const testRecord = {
  id: 'TEST001',
  title: 'Test Book',
  author: 'Test Author'
};

const exporter = new MARCExporter();
console.log(exporter.exportToMARCReadable(testRecord));
```

### Test 3: UI Component
1. Navigate to a catalog item page
2. Look for the "Export to MARC" section
3. Try previewing a record
4. Try downloading in different formats

## ❗ Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: Check your import paths match your actual file structure.

```typescript
// Debug: Add this to see your current location
console.log(__dirname);
```

### Issue: Style not applying
**Solution**: 
1. Check if your app supports regular `<style>` tags
2. Consider using CSS modules (see above)
3. Or use styled-components/emotion

### Issue: Firebase types missing
**Solution**: Ensure Firebase is installed:
```bash
npm install firebase
```

### Issue: TypeScript errors on record types
**Solution**: Create a proper type definition:

```typescript
// src/types/catalog.ts
export interface CatalogRecord {
  id?: string;
  title: string;
  author?: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  subjects?: string[];
  // ... all your fields
}
```

Then use it:
```typescript
import { CatalogRecord } from '../types/catalog';
import { MARCExporter } from '../utils/MARCExporter';

const exporter = new MARCExporter();
const record: CatalogRecord = { /* your data */ };
```

## 📚 Next Steps

1. ✅ Copy files to correct locations
2. ✅ Verify imports compile
3. ✅ Test with a sample record
4. ✅ Integrate into your UI
5. ✅ Add batch export to dashboard (optional)

## 🆘 Still Having Issues?

Check these files for examples:
- **MARCExportExamples-fixed.ts** - Usage patterns
- **MARC_EXPORT_README.md** - Full documentation
- **QUICK_START.md** - Step-by-step guide

## 📝 File Checklist

- [ ] MARCExporter.ts in /src/utils/
- [ ] BatchMARCExporter.ts in /src/utils/
- [ ] MARCExportButton.tsx in /src/catalog/components/ (or your components folder)
- [ ] Import paths updated to match your structure
- [ ] Project compiles without errors
- [ ] Can preview MARC output
- [ ] Can download MARC files

Once all boxes are checked, you're ready to export! ✨
