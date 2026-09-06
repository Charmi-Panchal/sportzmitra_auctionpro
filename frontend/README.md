# SportzMitra Auction Pro Frontend - Production Navigation Build

## Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/login
```

## Backend expected

```text
http://localhost:5000
```

## Login

```text
Super Admin: 9999999999 / 123456
Auction Admin: 8888888888 / 123456
```

## Main routes

```text
/login
/super-admin
/select-organization
/admin/organizations/:organizationId/auctions
/admin/auctions/:auctionId/dashboard
/admin/auctions/:auctionId/teams
/admin/auctions/:auctionId/players
/admin/auctions/:auctionId/live-control
/admin/auctions/:auctionId/reports
/live/:publicSlug
```

## Production-oriented changes

- Separate Teams page
- Separate Players page
- Auction workspace navigation
- Team logo upload/paste UI
- Public live screen uses Socket.IO snapshots without repeated API reloads
- Projector-friendly sports stadium UI
