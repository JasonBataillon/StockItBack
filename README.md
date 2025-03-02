# StockItBack

Instructions to run:

1. Create a file named ".env" in the root directory.
2. Obtain a Polygon.io API key from their website by creating an account on their website and generate a "new key".
3. Copy the key (this should be a long string of numbers and letter).
4. Open the .env file, input "VITE_POLYGON_API_KEY=", paste the key after and save the file.
5. Create a database to run the code.
6. Input "DATABASE_URL=" into the .env file and add this line filled out with the proper info (remove the ()'s from inside the URL) "postgresql://(database name):(password)@(location of the db (either this will be a URL to your db or localhost://(the port of your database)))/(server name)"
7. Input "JWT_SECRET=" into the .env file followed by a made up string of at least 20 random characters, symbols, or numbers.
8. Open a bash-terminal in the root directory and run the command "npm install" - this will install the required dependencies for the program to run.
9. Run "npx prisma migrate dev" to properly migrate the prisma.schema to the database.
10. Run "npm run dev" to run vite and launch the web server.
