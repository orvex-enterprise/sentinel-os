#!/usr/bin/env bash
set -euo pipefail

echo "Validating TypeScript schemas and exporting JSON Schema for Python..."
cd packages/schemas
npm run build
echo "Schema validation and JSON Schema export successful!"
