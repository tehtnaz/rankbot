# rankbot

A basic leveling bot for Discord created by @tehtnaz

This project is free for anyone to use. No warranty assured. Maintenance updates could occur, and if they do, they will be very irregular and rare

rankbot (BrokenBot2) © 2025 Jase Beaumont is licensed under GPLv3

Server: https://discord.gg/XQrtPXwzHk

## How to host it for yourself

- Rename `config-template.json` to `config.json`
- Update values in config (I think it might break if you dont fill in all values properly)
- Install node.js (v22 LTS (>=22.11.0) is required)
- Install packages - `npm install`
- Compile for typescript - `npx tsc`
- Create new database - `node ./package/dbInit.js --force`
- Deploy commands - `npm run deploy`
- Run - `npm start`

## How to use

- You can assign roles for different XP levels
- A level 0 role represents a join role (a role which is automatically assignment upon joining)
- You may display the top 5 users using /leaderboard
- /rank shows the XP and level of somebody
- Other commands have descriptions written in the slash command. They are pretty simple though.

## Suggested features (Unplanned for implementation, this project is only under maintenance)

- [ ] more xp for server booster(1) (multiplier)
- [ ] /role adds a role to someone
- [ ] add ability to disable certain channels from making you gain levels

(1) if you cannot detect if they’re boosting server, use particular role for assigning (AKA make it a global feature that you can make certain roles multiply XP
this can be enabled/disabled using similar settings system to soundbot

## How to transfer from MEE6

    1. npx tsc
    2. npm run mee6ripper <max_page_num> <server_id>
    3. Make sure database.sqlite already exists, otherwise run node ./package/dbInit.js --force
    4. npm run mee6ripper transfer
