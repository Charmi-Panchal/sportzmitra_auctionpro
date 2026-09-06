const pool = require('./src/config/db');

async function seed() {
  try {
    const userId = 2; // User 8888888888

    // 1. Create Org
    const [orgRes] = await pool.query(
      `INSERT INTO organizations (organization_name, contact_person, plan_type, status, created_by_user_id) 
       VALUES ('Demo Sports Academy', 'Admin', 'LIFETIME', 'ACTIVE', ?)`,
      [userId]
    );
    const orgId = orgRes.insertId;

    // 2. Add role for user
    await pool.query(
      `INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, 'SUPER_ADMIN')`,
      [userId]
    );

    const auctionId = 3; // Seed into BPL Season 10

    // 4. Create Auction State
    await pool.query(
      `INSERT IGNORE INTO auction_state (auction_id, state, current_category, current_round) VALUES (?, 'NOT_STARTED', 'BATSMAN', 'MAIN')`,
      [auctionId]
    );

    // 5. Create Categories
    const categories = [
      { name: 'BATSMAN', order: 1, base: 1000, inc: 500 },
      { name: 'BOWLER', order: 2, base: 800, inc: 200 },
      { name: 'ALLROUNDER', order: 3, base: 1200, inc: 500 },
    ];
    for (const cat of categories) {
      await pool.query(
        `INSERT INTO auction_categories (auction_id, category_name, display_order, status, base_price, bid_increment) 
         VALUES (?, ?, ?, 'ACTIVE', ?, ?)`,
        [auctionId, cat.name, cat.order, cat.base, cat.inc]
      );
    }

    // 6. Create Teams
    const teams = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'SRH'];
    for (const t of teams) {
      await pool.query(
        `INSERT INTO teams (auction_id, team_name, short_name, remaining_purse, status, player_limit) 
         VALUES (?, ?, ?, 100000, 'ACTIVE', 15)`,
        [auctionId, t + ' Franchise', t]
      );
    }

    // 7. Create Players
    const names = ['Virat', 'Rohit', 'Dhoni', 'Bumrah', 'Hardik', 'Pant', 'Gill', 'Surya', 'Jadeja', 'Siraj', 'Shami', 'Rahul', 'Iyer', 'Ashwin', 'Chahal', 'Kuldeep'];
    let cIdx = 0;
    for (let i = 0; i < names.length; i++) {
      const cat = categories[cIdx].name;
      const base = categories[cIdx].base;
      cIdx = (cIdx + 1) % categories.length;
      
      await pool.query(
        `INSERT INTO players (auction_id, player_name, category, player_role, base_price, status, auction_round) 
         VALUES (?, ?, ?, ?, ?, 'AVAILABLE', 'MAIN')`,
        [auctionId, names[i], cat, cat, base]
      );
    }

    console.log("Demo data successfully created! Auction ID:", auctionId);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
