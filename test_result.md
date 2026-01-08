# Testing Protocol for Shadow Wolves Productions Admin CMS

## Test Scope
- Admin login with password authentication
- Admin dashboard displaying all films
- Add new film functionality
- Edit existing film functionality
- Delete film functionality
- Toggle featured status
- Image upload functionality
- Public Films page consuming API data
- Film modal displaying API data correctly

## Test Credentials
- Admin Password: shadowwolves2024

## Recent Changes
- Added admin panel at /admin route
- Backend API endpoints for CRUD operations on films
- MongoDB integration for data persistence
- Image upload functionality
- Seeded 6 initial films from mock data

## Expected Behavior
- /admin should show login page
- Correct password should redirect to /admin/dashboard
- Dashboard should display all films from database
- Add Film should create new film
- Edit should update existing film
- Delete should remove film
- Featured toggle should update film
- Public Films page should show API data
