# Jyoti & Vishnu — South Indian Wedding Invitation

## Original Problem Statement
Rebuild a digital wedding invitation site as a paginated "book" that
exactly matches four reference screenshots (deep maroon + cream + gold),
then generate a downloadable PDF of the whole invitation from the browser.

## Architecture
- **Frontend**: React 19 + Tailwind + custom App.css (CRA + craco)
- **Backend**: FastAPI on `/api`, MongoDB via motor
- **PDF**: html2canvas + jsPDF — client-side, landscape A4, one snapshot per page
  → user gets a real browser "Save As" download (no sandbox links)

## Pages (9-page book with prev/next + sidebar navigation)
1. Title cover ("A wedding invitation") 
2. Ganesh invocation + "Together with our families" + Jyoti & Vishnu
3. Welcome — bride & groom photos in floral wreaths, elephant footer
4. Story — "Two homes, one joyful beginning" narrative
5. Events — Haldi + Sangeet (alternating image-text)
6. Events — Muhurtham + Reception & Sadhya
7. Venue — Muhurtham time + Utsav Resort details + directions
8. RSVP — "Will we see you there?" with modal RSVP form
9. Closing — "With love, we look forward to celebrating with you" in gold diamond frame on plum

## Implemented (2026-02)
- 1:1 rebuild against the 4 reference artefact screenshots
- Top bar with Om + "Jyoti weds Vishnu" + Music + Download PDF + RSVP CTA
- Bottom bar: BOOK-POST · WEDDING INVITATION · 01 NOVEMBER 2026 + Prev/Next + page count
- Left vertical sidebar with 01–09 numbered dots (active in gold) + THE NAIR FAMILY · 2026 vertical text
- Client-side PDF export producing a 9-page A4 landscape PDF (~2.2MB)
- RSVP form → `POST /api/rsvp` (MongoDB)
- All decorative motifs (marigold toran, diamond frame, floral wreaths, elephants) rendered in inline SVG for crisp PDF export

## APIs
- `POST /api/rsvp` — save RSVP
- `GET /api/rsvp/count` — attending count

## Backlog / Next
- Real background music track (currently decorative icon only)
- Real photos of bride/groom + Haldi/Sangeet events (currently royalty-free stock)
- Guest-specific invite links (`/rsvp/:token`) so each guest gets a personal RSVP
