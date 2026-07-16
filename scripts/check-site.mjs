import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, normalize, relative, resolve, sep } from "node:path";

const root = resolve(process.cwd(), "site");
const required = [
  "index.html",
  "direct/index.html",
  "direct/support/index.html",
  "direct/privacy/index.html",
  "direct/terms/index.html",
  "appstore/index.html",
  "appstore/support/index.html",
  "appstore/privacy/index.html",
  "appstore/terms/index.html",
  "assets/site.css",
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    if (entry.isFile()) files.push(path);
  }
  return files;
}

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function internalTarget(source, href) {
  const clean = href.split("#", 1)[0].split("?", 1)[0];
  if (!clean || clean.startsWith("#")) return null;
  if (/^(https?:|mailto:|tel:)/i.test(clean)) return null;
  if (clean.startsWith("/")) {
    throw new Error(`${relative(root, source)} uses root-relative link ${href}`);
  }
  let target = normalize(resolve(dirname(source), clean));
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    throw new Error(`${relative(root, source)} links outside site: ${href}`);
  }
  if (clean.endsWith("/")) target = join(target, "index.html");
  return target;
}

for (const path of required) {
  if (!(await exists(join(root, path)))) throw new Error(`Missing required file: ${path}`);
}

const htmlFiles = (await walk(root)).filter((path) => path.endsWith(".html"));
const errors = [];
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (!/<html lang="en">/.test(html)) errors.push(`${relative(root, file)} has no language declaration`);
  if (!/<meta name="viewport"/.test(html)) errors.push(`${relative(root, file)} has no viewport metadata`);
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    try {
      const target = internalTarget(file, match[1]);
      if (target && !(await exists(target))) {
        errors.push(`${relative(root, file)} has broken link ${match[1]}`);
      }
    } catch (error) {
      errors.push(error.message);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML pages and ${required.length} required paths.`);
