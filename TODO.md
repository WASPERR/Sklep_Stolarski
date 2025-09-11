# TODO: Update Admin Panel to Fetch Categories from Database

## Steps to Complete

- [x] Add GET /api/categories endpoint in Backend/server.js to fetch all categories from the database
- [ ] Update AdminPanel.jsx to fetch categories on component mount and store them in state
- [ ] Replace hardcoded category options in the select dropdown with dynamic options from fetched categories
- [ ] Adjust form handling to use category_id instead of category name for submissions
- [ ] Update product editing to correctly set the selected category based on category_id
- [ ] Test the new functionality by adding/editing products with dynamic categories
- [ ] Ensure backend product creation/editing handles category_id properly (may need updates if not already)

## Notes
- Categories are stored in a separate 'categories' table with category_id, name, description
- Products table references categories by category_id
- Frontend currently uses category names as strings; need to map to category_id for database consistency
