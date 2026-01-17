// .eslintrc.cjs
module.exports = {
  root: true,
  ignorePatterns: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "components/ui/**"
  ],
  extends: ["next/core-web-vitals", "next/typescript"],
  plugins: ["import"],
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
