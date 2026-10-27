// data.js の SITE を JSON で出力する（build.py がコース詳細ページを作るときに使う）
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8");
const SITE = new Function(src + "\nreturn SITE;")();
process.stdout.write(JSON.stringify({ courses: SITE.courses, courseCats: SITE.courseCats }));
