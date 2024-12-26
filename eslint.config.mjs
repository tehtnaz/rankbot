import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    eslintConfigPrettier,
    {
        ignores: ["**/*.js", "**/*.cjs", "src/later-reuse/", "src/old/", "src/models/old/"]
    },
    {
        languageOptions: {
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json"
            }
        },

        rules: {
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-misused-promises": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/restrict-plus-operands": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            "no-useless-escape": "warn",
            "@typescript-eslint/no-deprecated": "error"
        }
    }
);
