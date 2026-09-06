DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_get_public_auction_snapshot`$$
CREATE PROCEDURE `sp_get_public_auction_snapshot`(IN p_auction_id BIGINT)
BEGIN
  -- 0. Auction details
  SELECT a.*, o.organization_name 
  FROM auctions a 
  LEFT JOIN organizations o ON a.organization_id = o.id 
  WHERE a.id = p_auction_id;
  
  -- 1. State details (with current player and highest bidder team info)
  SELECT s.*, 
         p.player_name, p.category, p.player_role, p.base_price, p.photo_url, p.age, p.batting_style, p.bowling_style,
         t.team_name AS highest_team_name
  FROM auction_state s
  LEFT JOIN players p ON s.current_player_id = p.id
  LEFT JOIN teams t ON s.highest_team_id = t.id
  WHERE s.auction_id = p_auction_id;

  -- 2. Teams (used for teams and teamsSummary)
  SELECT id, team_name, owner_name, logo_url, total_purse, remaining_purse, (total_purse - remaining_purse) AS used_amount 
  FROM teams 
  WHERE auction_id = p_auction_id AND COALESCE(is_deleted, 0) = 0;

  -- 3. Sold Players
  SELECT p.*, t.team_name as sold_team_name 
  FROM players p 
  LEFT JOIN teams t ON p.sold_team_id = t.id 
  WHERE p.auction_id = p_auction_id AND p.status = 'SOLD' AND COALESCE(p.is_deleted, 0) = 0;

  -- 4. Unsold Players
  SELECT p.* FROM players p WHERE p.auction_id = p_auction_id AND p.status = 'UNSOLD' AND COALESCE(p.is_deleted, 0) = 0;

  -- 5. Pending Players (AVAILABLE, IN_AUCTION)
  SELECT p.* FROM players p WHERE p.auction_id = p_auction_id AND p.status IN ('AVAILABLE', 'IN_AUCTION') AND COALESCE(p.is_deleted, 0) = 0;

  -- 6. Category Summary
  SELECT category, COUNT(*) as total, SUM(status='SOLD') as sold, SUM(status='UNSOLD') as unsold, SUM(status IN ('AVAILABLE', 'IN_AUCTION')) as pending 
  FROM players WHERE auction_id = p_auction_id AND COALESCE(is_deleted, 0) = 0 
  GROUP BY category;

  -- 7. Dashboard Summary
  SELECT 
    (SELECT COUNT(*) FROM teams WHERE auction_id = p_auction_id AND COALESCE(is_deleted, 0) = 0) as total_teams,
    (SELECT COUNT(*) FROM players WHERE auction_id = p_auction_id AND COALESCE(is_deleted, 0) = 0) as total_players,
    (SELECT SUM(status='SOLD') FROM players WHERE auction_id = p_auction_id AND COALESCE(is_deleted, 0) = 0) as sold_players;
END$$
DELIMITER ;
