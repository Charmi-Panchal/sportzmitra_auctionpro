const pool = require('./src/config/db');

async function cleanAndSeed() {
  try {
    console.log("Emptying database...");
    
    // Disable FK checks to truncate all tables safely
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'auction_action_logs',
      'auction_categories',
      'auction_config_audit_logs',
      'auction_state',
      'auctions',
      'bids',
      'import_batch_errors',
      'import_batches',
      'notification_queue',
      'org_players',
      'organization_admins',
      'organizations',
      'otp_requests',
      'player_auction_attempts',
      'players',
      'team_purse_transactions',
      'teams',
      'user_roles',
      'users'
    ];

    for (const table of tables) {
      await pool.query(`TRUNCATE TABLE ${table}`);
    }

    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("Database empty. Seeding demo data...");

    // 1. Create Super Admin User
    const [saRes] = await pool.query(
      `INSERT INTO users (name, mobile, email, status) VALUES ('Super Admin Demo', '9999999999', 'super@demo.com', 'ACTIVE')`
    );
    const superAdminId = saRes.insertId;
    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES (?, 'SUPER_ADMIN')`,
      [superAdminId]
    );

    // 2. Create Auction Admin User
    const [aaRes] = await pool.query(
      `INSERT INTO users (name, mobile, email, status) VALUES ('Auction Admin Demo', '8888888888', 'admin@demo.com', 'ACTIVE')`
    );
    const auctionAdminId = aaRes.insertId;
    // They get role 'AUCTION_ADMIN'
    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES (?, 'AUCTION_ADMIN')`,
      [auctionAdminId]
    );

    // 3. Create Org (owned by Super Admin)
    const [orgRes] = await pool.query(
      `INSERT INTO organizations (organization_name, contact_person, plan_type, status, created_by_user_id) 
       VALUES ('Demo Sports Academy', 'SA Contact', 'LIFETIME', 'ACTIVE', ?)`,
      [superAdminId]
    );
    const orgId = orgRes.insertId;

    // 4. Assign Auction Admin to Org
    await pool.query(
      `INSERT INTO organization_admins (organization_id, user_id, status) VALUES (?, ?, 'ACTIVE')`,
      [orgId, auctionAdminId]
    );

    // 5. Create Auction
    const [auctionRes] = await pool.query(
      `INSERT INTO auctions (
        organization_id, created_by_user_id, auction_name, auction_code, public_slug, 
        auction_type, total_purse_per_team, min_players_per_team, max_players_per_team, 
        minimum_bid_increment, status, auction_flow_type, category_flow, default_base_price, default_bid_increment, is_active
      ) VALUES (
        ?, ?, 'Demo IPL 2026', 'DIPL26', 'dipl26',
        'CATEGORY_WISE', 100000, 11, 15,
        500, 'LIVE', 'CATEGORY_WISE', 'CATEGORY_UNSOLD_AT_END', 1000, 500, 1
      )`,
      [orgId, auctionAdminId]
    );
    const auctionId = auctionRes.insertId;

    // 6. Create Auction State
    await pool.query(
      `INSERT INTO auction_state (auction_id, state, current_category, current_round) VALUES (?, 'NOT_STARTED', 'BATSMAN', 'MAIN')`,
      [auctionId]
    );

    // 7. Create Categories
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

    // 8. Create Teams
    const teams = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'SRH'];
    for (const t of teams) {
      await pool.query(
        `INSERT INTO teams (auction_id, team_name, short_name, remaining_purse, status, player_limit) 
         VALUES (?, ?, ?, 100000, 'ACTIVE', 15)`,
        [auctionId, t + ' Franchise', t]
      );
    }

    // 9. Create Players
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

    console.log("Database reset and seeded successfully.");
    console.log("Super Admin Login: Mobile = 9999999999");
    console.log("Auction Admin Login: Mobile = 8888888888");
    console.log("Demo Auction ID:", auctionId);
    
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed:", err);
    process.exit(1);
  }
}

cleanAndSeed();
