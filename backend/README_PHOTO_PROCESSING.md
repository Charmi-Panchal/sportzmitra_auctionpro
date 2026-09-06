# Player photo processing

This version supports manual upload and URL-based photo import from Excel/Google Form exports.

Supported input types:
- JPG / JPEG
- PNG
- WEBP
- GIF
- HEIC / HEIF from iPhone

Processing:
1. Converts input to high-quality JPEG.
2. Auto-rotates using EXIF orientation.
3. Saves original converted photo in `src/uploads/players/original`.
4. Creates a face-focused safe crop in `src/uploads/players/processed`.
5. Stores processed photo as `org_players.photo_url` and original as `org_players.original_photo_url`.

Note: This version uses a safe portrait crop optimized for player profile photos. It preserves the original converted image. ML-based face detection can be added later without changing the DB shape.
