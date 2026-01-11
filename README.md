# Knowledge Quiz

This project is a full-stack application that generates quizzes automatically from Wikipedia articles using a Large Language Model (LLM). Users provide a Wikipedia URL, and the system scrapes the content, generates quiz questions, and stores results for future reference.
<img width="1663" height="911" alt="Screenshot 2026-01-11 114505" src="https://github.com/user-attachments/assets/e6200dbc-2392-45f5-94d4-96d782c5b519" />

___
## Features
# Tab 1 – Generate Quiz
<img width="812" height="890" alt="Screenshot 2026-01-11 114607" src="https://github.com/user-attachments/assets/ae09c567-ed39-44ea-8d24-d12bf83c6701" />


* Input a Wikipedia article URL

* Scrape article content using BeautifulSoup

* Generate a quiz (5–10 questions) using an LLM (Gemini / free-tier via LangChain)

* Each question includes:

            Question text

            4 options (A–D)

            Correct answer

* Explanation

         Difficulty level (easy / medium / hard)

         Suggest related Wikipedia topics

         Store scraped and generated data in PostgreSQL

         Display results in a clean, card-based UI

# Tab 2 – Past Quizzes (History) 
<img width="1507" height="897" alt="Screenshot 2026-01-11 114523" src="https://github.com/user-attachments/assets/838b4811-2eb9-4d0a-bd8b-dcadb2a5b8ea" />


* View all previously processed Wikipedia URLs

* Display quizzes in a table format

* Open full quiz details in a reusable modal

## Tech Stack

* Frontend: React / Vue / HTML (minimal UI)

* Backend: Python (FastAPI or Django)

* Database: PostgreSQL

* LLM Integration: LangChain + Gemini (free tier) or other free LLM APIs

* Web Scraping: BeautifulSoup
