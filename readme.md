Smart Nutrition Food MVP
This is a simple MVP built for smart nutrition food calculation. The app calculates the nutrition of dishes by analyzing ingredients and using AI for ingredient suggestions. The MVP uses a MERN stack (MongoDB, Express, React, Node.js) for rapid development, but it can be extended with other frameworks like Django or NestJS in the future.

Features
Search Box: Allows users to search ingredients or dishes with autocomplete suggestions. Suggestions are based on the database and powered by AI if no exact match is found.

Nutrition Calculation: Provides nutritional data for ingredients and dishes.

Fetch nutritional data based on ingredients from the database.

Calculate nutrition for a given dish.

Use Google Bard API for ingredient suggestions.

Database: Ingredients and dishes are stored in a PostgreSQL database, which is populated from an imported spreadsheet.

AI Integration: If a user can't find a match in the search suggestions, AI will suggest ingredients based on the dish name and fetch their nutritional data from the database.

Installation
Prerequisites
Node.js (v14.x or higher)

PostgreSQL deployed on supabase

Google Bard API (for AI-based ingredient suggestions)

Backend Setup
Clone the repository:

bash
Copy
Edit
git clone <repo-url>
cd <project-directory>
Install dependencies:

bash
Copy
Edit
npm install
Configure the PostgreSQL database:

Create a database and import your spreadsheet data into PostgreSQL.

Update your .env file with the correct database connection details.

Start the backend server:

bash
Copy
Edit
npm run start
The server will run on http://localhost:5000.

Frontend Setup
Navigate to the frontend directory:

bash
Copy
Edit
cd client
Install dependencies:

bash
Copy
Edit
npm install
Start the frontend:

bash
Copy
Edit
npm run start
The frontend will run on http://localhost:3000.

Endpoints
GET /api/nutrition
Description: Fetch nutritional information for a specific ingredient.

Query Params:

food_data: The ingredient or dish name (e.g., "Buckwheat").

Example:

bash
Copy
Edit
GET http://localhost:5000/api/nutrition?food_data=Buckwheat
POST /api/calculate-nutrition
Description: Calculate the nutrition for a specific dish.

Request Body:

json
Copy
Edit
{
  "dishName": "paneer burji"
}
Example:

bash
Copy
Edit
POST http://localhost:5000/api/calculate-nutrition
AI Integration
Google Bard API is used for ingredient suggestions when a match isn't found in the database.

For the first MVP version, it uses a back-off strategy with partial ingredient matches and a hierarchical ingredient taxonomy. Future versions will incorporate fuzzy matching and add synonyms to the database for better accuracy.

Future Improvements
Fuzzy Matching: Implementing external libraries like fuzzy-matching or fuzzy-search for better ingredient matching.

Synonyms: Adding synonyms for ingredients in the database to improve the AI's understanding.

Backend Enhancement: Moving to a more robust backend framework like Django or NestJS as the project scales.

Frontend Enhancement: Improving the frontend to offer more interactive features, including better user interface (UI) and user experience (UX).