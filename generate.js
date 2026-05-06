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

function buildHTML(top3, rest) {
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

    .games_results_banner_container {
      font-family: Montserrat;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: start;
      background-image: url('https://lh3.googleusercontent.com/d/1EFIcovnHrCFnmw-4dgM0ZWgrJTy3U1AL');
      color: white;
    }

    .games_results_banner_logo {
      width: 20rem;
    }

    .games_results_banner_logo img {
      width: 100%;
    }

    .games_results_banner_title {
      font-size: 1.6rem;
      font-weight: bold;
      padding-top: 50px;
    }

    .games_results_banner_description {
      font-size: 1.2rem;
      padding-top: 5px;
    }

    .games_results_container {
      padding: 20px;
    }

    .games_results_grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .games_results_card {
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 16px;
      background: white;
    }

    .games_results_card h3 {
      margin: 0 0 8px;
      font-size: 16px;
    }

    .games_results_card p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }

    .games_results_top3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }

    .games_results_list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .games_results_list .games_results_card {
      padding: 12px 14px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media (max-width: 900px) {
      .games_results_top3 {
        grid-template-columns: 1fr;
      }
    }
    
  </style>
</head>
<body>
  <div class="games_results_banner_container">
    <div class="games_results_banner_logo"><img src="https://lh3.googleusercontent.com/d/1Ve0TXrrlzMmQsYIb9Eo-NMtE4LFYilHN" alt="TGA Travel Gear Adventure"></div>
    <div class="games_results_banner_title">TGA Adventure Games Leaderboard</div>
    <div class="games_results_banner_description">These are the total scores (total of all games the individual has participated in.)</div>
  </div>
  <div class="games_results_container">
    <!-- 🏆 TOP 3 PODIUM -->
    <div class="games_results_top3">
    
      ${top3.map((row, index) => {
        const fullName = `${row["First Name"] || ""} ${row["Last Name"] || ""}`.trim();
    
        return `
          <div class="games_results_card">
    
            ${
              index === 0 ? `<h3 class="rank-title first">First Place</h3>` :
              index === 1 ? `<h3 class="rank-title second">Second Place</h3>` :
              `<h3 class="rank-title third">Third Place</h3>`
            }
    
            <p>#${index + 1} - ${fullName} - Score: ${row.Score}</p>
          </div>
        `;
      }).join("")}
    
    </div>
    
    <!-- 📋 REST OF LEADERBOARD -->
    <div class="games_results_list">
    
      ${rest.map((row, index) => {
        const place = index + 4; // because top 3 already used
        const fullName = `${row["First Name"] || ""} ${row["Last Name"] || ""}`.trim();
    
        return `
          <div class="games_results_card">
            #${place} - ${fullName} - Score: ${row.Score}
          </div>
        `;
      }).join("")}
    
    </div>
  </div>
</body>
</html>
`;
}

async function run() {
  try {
    const csv = await fetchCSV();
    let data = parseCSV(csv);
    
    // Convert Score to number + sort highest → lowest
    data = data
      .map(row => ({
        ...row,
        Score: Number(row.Score) || 0
      }))
      .sort((a, b) => b.Score - a.Score);
    
    const top3 = data.slice(0, 3);
    const rest = data.slice(3, 20);

    const html = buildHTML(top3, rest);

    fs.writeFileSync("docs/index.html", html);

    console.log("✅ HTML generated");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

run();
