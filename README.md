# ⚔ Anime Battle — Telegram Backend

A mobile-first anime friend challenge website with a real backend and Telegram bot/channel integration.

## Architecture

- Frontend: HTML + CSS + JavaScript
- Backend: Flask + SQLite
- Telegram: Bot API for notifications and /start + /stats
- Hosting: Render or another Python host
- Database: SQLite for challenges and results

## Features

- Create 10-question anime challenges
- Server-generated challenge IDs
- Answer keys stored on the backend, not inside invite URLs
- Cross-device leaderboard
- Telegram channel notifications for new challenges and results
- Telegram bot commands: /start and /stats
- No user login required

## Run locally

Install dependencies with: pip install -r requirements.txt

Set TELEGRAM_BOT_TOKEN to your bot token and TELEGRAM_CHANNEL_ID to your channel username, then run: python server.py

## Telegram setup

1. Create a bot with @BotFather on Telegram.
2. Copy the bot token into the TELEGRAM_BOT_TOKEN environment variable.
3. Add the bot to your Telegram channel as an administrator with permission to post.
4. Set TELEGRAM_CHANNEL_ID to the channel username, for example @your_channel.
5. Never put the bot token in app.js, index.html, or GitHub.

The bot sends a notification when a challenge is created and when a friend submits a result.

## Render deployment

The repository includes render.yaml. Create a Render web service from this repository and set TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID as environment variables.

Start command: gunicorn server:app

## Frontend hosting

The easiest setup is to serve the frontend from the same Flask service. If the frontend stays on GitHub Pages, set window.ANIME_API_URL to your Render backend URL before app.js loads.

## Security

The Telegram bot token is a server secret. Use environment variables only. Do not commit it to the repository.
