// eslint.config.mjs
import { dirname } from "path"
import { fileURLToPath } from "url"

import { FlatCompat } from "@eslint/eslintrc"
import importPlugin from "eslint-plugin-import"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "components/ui/**"
    ]
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    plugins: {
      import: importPlugin
    },
    rules: {
      "no-undef": "off",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["sibling", "parent"], "index", "object"],
          "newlines-between": "always",
          pathGroups: [
            {
              pattern: "@app/**",
              group: "external",
              position: "after"
            }
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ]
    }
  }
]

export default eslintConfig
