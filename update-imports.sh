#!/bin/bash

echo "Updating import paths for monorepo..."

# Update database imports
find apps/web -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from ["'\''"]@/lib/db["'\''"]*|from "@dealsphere/database"|g' {} +

# Update field-mapper imports
find apps/web -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from ["'\''"]@/lib/field-mapper["'\''"]*|from "@dealsphere/shared"|g' {} +

# Update research-worker imports
find apps/web -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from ["'\''"]@/services/research-worker["'\''"]*|from "@dealsphere/shared"|g' {} +

echo "Import paths updated!"
echo "Remaining @/ imports that may need manual attention:"
find apps/web -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from [\"'']@/" {} + | head -10