import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const patterns = [
  { label: "Google API key", regex: /AIza[0-9A-Za-z_-]{20,}/g },
  { label: "MongoDB Atlas URI", regex: /mongodb\+srv:\/\/[^\s)"']+/g },
  { label: "OpenAI API key", regex: /sk-[A-Za-z0-9_-]{20,}/g },
  { label: "Hugging Face token", regex: /hf_[A-Za-z0-9]{20,}/g },
  {
    label: "JWT secret assignment",
    regex:
      /^\s*(?:export\s+)?(JWT_SECRET|JWT_REFRESH_SECRET)\s*=\s*(?!changeme|your-|example|replace|<|test-)[^\s#"']{16,}/gim
  },
  {
    label: "AI API key assignment",
    regex:
      /^\s*(?:export\s+)?(GEMINI_API_KEY|HUGGINGFACE_API_KEY|OPENAI_API_KEY)\s*=\s*(?!your-|example|replace|<|test-)[^\s#"']{12,}/gim
  }
];

const ignoredPathParts = ["/node_modules/", "/dist/", "/.next/", "/coverage/"];

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => !ignoredPathParts.some((part) => `/${file}`.includes(part)));

const findings = [];

for (const file of trackedFiles) {
  if (!existsSync(file)) {
    continue;
  }

  const lines = readFileSync(file, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    patterns.forEach(({ label, regex }) => {
      regex.lastIndex = 0;

      if (regex.test(line)) {
        findings.push({ file, line: index + 1, label });
      }
    });
  });
}

if (findings.length > 0) {
  console.error("Potential secret-looking values found. Values are redacted:");
  findings.forEach((finding) => {
    console.error(`- ${finding.file}:${finding.line} ${finding.label}`);
  });
  process.exit(1);
}

console.log("No secret-looking values found in tracked files.");
