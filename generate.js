const fs = require("fs");
const Papa = require("papaparse");

// 🔧 PUT YOUR SHEET URL HERE
const SHEET_URL = process.env.SHEET_URL;

if (!SHEET_URL) {
  throw new Error("Missing SHEET_URL environment variable");
}

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
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 16px;
      padding: 18px 18px 16px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    /* subtle hover lift */
    .games_results_card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
    }

    /* top highlight bar (modern leaderboard feel) */
    .games_results_card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 4px;
      width: 100%;
      background: linear-gradient(90deg, #0f172a, #1e3a8a, #2563eb);
      opacity: 0.9;
    }

    /* title / name styling (first field usually) */
    .games_results_card h3,
    .games_results_card strong:first-child {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
    }

    /* general text rows */
    .games_results_card p {
      margin: 6px 0 0;
      font-size: 1rem;
      color: #475569;
      line-height: 1.4;
    }

    /* label styling (Score, Name, etc.) */
    .games_results_card strong {
      color: #0f172a;
      font-weight: 600;
    }

    /* SCORE emphasis if present */
    .games_results_card p:has(strong:contains("Score")) {
      font-size: 15px;
      font-weight: 700;
    }

    .games_results_card:nth-child(1) {
      border: 1px solid #fbbf24;
      background: linear-gradient(180deg, #fffdf5, #ffffff);
    }

    .games_results_card:nth-child(1)::before {
      background: linear-gradient(90deg, #fbbf24, #f59e0b);
    }

    .games_results_card:nth-child(2) {
      border: 1px solid #cbd5e1;
    }

    .games_results_card:nth-child(3) {
      border: 1px solid #d6b37a;
    }

    .rank-title {
      margin: 0 0 10px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 10px;
      border-radius: 999px;
      display: inline-block;
    }

    /* 1st place */
    .rank-title.first {
      background: linear-gradient(90deg, #fbbf24, #f59e0b);
      color: #1f2937;
    }

    /* 2nd place */
    .rank-title.second {
      background: linear-gradient(90deg, #cbd5e1, #94a3b8);
      color: #0f172a;
    }

    /* 3rd place */
    .rank-title.third {
      background: linear-gradient(90deg, #d6b37a, #b45309);
      color: #1f2937;
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

    @media (max-width: 900px) {
      .games_results_top3 {
        grid-template-columns: 1fr;
      }
    }

    .games_results_list .games_results_card {
      padding: 12px 14px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }    
  </style>
</head>
<body>
  <div class="games_results_banner_container">
    <div class="games_results_banner_logo"><img src="{Your logo link here}" alt="TGA Travel Gear Adventure"></div>
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
    
            <p>#${index + 1} - ${fullName} - Score: ${row["Total Score"]}</p>
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
            #${place} - ${fullName} - Score: ${row["Total Score"]}
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
        Score: Number(row["Total Score"]) || 0
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
