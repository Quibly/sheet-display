const fs = require("fs");
const Papa = require("papaparse");

// 🔧 PUT YOUR SHEET URL HERE
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFUuAjoK9z114GjHURfSbMgwGcn2EplLALc09pwMshTnuNsnvp5T_vn2cKghjql9Fyo4XyiT6EGCkl/pub?gid=0&single=true&output=csv";

async function fetchCSV() {
  const res = await fetch(SHEET_URL);
  return await res.text();
}

function parseCSV(csv) {
  return Papa.parse(csv, {
    header: true,     // uses first row as keys
    skipEmptyLines: true
  }).data;
}

function buildHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      font-family: Montserrat, sans-serif;
      background: #ffffff;
    }

    .container {
      padding: 20px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .card {
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 16px;
      background: white;
    }

    .card h3 {
      margin: 0 0 8px;
      font-size: 16px;
    }

    .card p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="grid">
      ${data.map(row => `
        <div class="card">
          ${Object.entries(row).map(([key, value]) => `
            <p><strong>${key}:</strong> ${value}</p>
          `).join("")}
        </div>
      `).join("")}
    </div>
  </div>
</body>
</html>
`;
}

async function run() {
  try {
    const csv = await fetchCSV();
    const data = parseCSV(csv);

    // 🔥 OPTIONAL: crop/filter here later
    const trimmed = data.slice(0, 20);

    const html = buildHTML(trimmed);

    fs.writeFileSync("public/index.html", html);

    console.log("✅ HTML generated");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

run();
