# The Roundup Bot

A Discord bot for the Vancouver ACX server that monitors all channels, collects shared links and upcoming events, and posts a digest summary to #general every three days.

## What it does

- Watches all channels on the server for shared links and articles
- Tracks Discord scheduled events
- Filters out junk URLs (Discord invites, Google Maps, event RSVPs)
- Posts a formatted digest to #general every 3 days automatically
- Supports a /roundup slash command to trigger a digest on demand

## Example output

    📋 Here's what happened in the last three days

    🔗 Links shared around the server
    • https://www.astralcodexten.com/p/some-post — posted by username in #share-links on Sun May 24 2026

    📅 Upcoming events on the server
    • Lynn Creek Nature Walk — Sat May 30 2026 — ACX Nature Walk. Everyone carry water and snacks

## Tech stack

- Runtime: Node.js 20
- Discord library: discord.js v14
- Database: SQLite via better-sqlite3
- Scheduler: node-cron
- Deployment: Docker and Docker Compose on Ubuntu VM
- Automation: Ansible

## Project structure

    the-roundup-bot/
    ├── src/
    │   ├── index.js        # Entry point
    │   ├── listener.js     # Captures links and events from messages
    │   ├── db.js           # SQLite database setup and queries
    │   ├── scheduler.js    # 3-day cron trigger
    │   ├── commands.js     # /roundup slash command
    │   └── digest.js       # Builds and posts the summary
    ├── .env.example        # Environment variable template
    ├── Dockerfile
    └── docker-compose.yml

## Setup

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- A Discord bot token from https://discord.com/developers/applications

### Environment variables

Copy .env.example to .env and fill in your values:

    DISCORD_TOKEN=your_bot_token_here
    DIGEST_CHANNEL_ID=your_general_channel_id_here
    CLIENT_ID=your_discord_app_id_here
    GUILD_ID=your_discord_server_id_here
    CRON_SCHEDULE=0 9 */3 * *

### Discord bot permissions required

- View Channels
- Send Messages
- Read Message History
- Add Reactions
- Manage Events

### Discord bot intents required

- Message Content Intent
- Server Members Intent
- Presence Intent
- Guild Scheduled Events

### Run locally

    npm install
    node src/index.js

### Run with Docker

    docker compose up -d

## Deployment

The bot is deployed via Ansible. The playbook deploy-roundup.yml handles cloning the repo, copying the .env file, building the Docker image, and starting the container on the target VM.

    ansible-playbook playbooks/deploy-roundup.yml

## Configuration

| Variable | Description | Default |
|---|---|---|
| DISCORD_TOKEN | Bot token from Discord Developer Portal | required |
| DIGEST_CHANNEL_ID | Channel ID where digest is posted | required |
| CLIENT_ID | Discord application ID | required |
| GUILD_ID | Discord server ID | required |
| CRON_SCHEDULE | Cron expression for digest schedule | 0 9 */3 * * |

### Changing the digest schedule

Edit CRON_SCHEDULE in your .env file and restart the container.

| Schedule | Cron expression |
|---|---|
| Every day at 9am | 0 9 * * * |
| Every 2 days at 9am | 0 9 */2 * * |
| Every 3 days at 9am | 0 9 */3 * * |

## Junk URL filter

The bot automatically ignores the following URL types:

- Discord invite links (discord.gg)
- Discord event links (discord.com/events)
- Google Maps links (maps.app.goo.gl)
- Partiful event links (partiful.com)
- Luma event links (luma.com, lu.ma)

## License

MIT