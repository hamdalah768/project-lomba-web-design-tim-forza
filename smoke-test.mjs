import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const pages = ["index.html", "login.html", "search.html", "learn.html", "path.html", "studio.html", "stories.html", "brand.html", "404.html"];
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

for (const page of pages) {
  const file = join(root, page);
  check(existsSync(file), `${page}: file tidak ditemukan`);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  check(/<!doctype html>/i.test(html), `${page}: doctype hilang`);
  check(/<title>[^<]+<\/title>/i.test(html), `${page}: title hilang`);
  check(/assets\/css\/styles\.css/.test(html), `${page}: stylesheet bersama hilang`);
  check(/assets\/js\/app\.js/.test(html), `${page}: javascript bersama hilang`);
  check(!/lh3\.googleusercontent\.com|cdn\.tailwindcss\.com/.test(html), `${page}: masih memakai resource rancangan eksternal lama`);

  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/gi)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(reference)) continue;
    const pathOnly = reference.split("?")[0].split("#")[0];
    check(existsSync(join(root, pathOnly)), `${page}: referensi lokal hilang -> ${reference}`);
  }
}

check(existsSync(join(root, "assets/images/founder.png")), "aset founder.png hilang");
check(existsSync(join(root, "assets/css/styles.css")), "styles.css hilang");
check(existsSync(join(root, "assets/js/app.js")), "app.js hilang");

if (failures.length) {
  console.error("SMOKE TEST GAGAL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`SMOKE TEST LULUS: ${pages.length} halaman dan seluruh referensi lokal tersedia.`);
}
