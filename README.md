# rankbot

A basic leveling bot for Discord created by @tehtnaz

 rankbot © 2024 by Jase Beaumont is licensed under CC BY-NC-SA 4.0 

## How to host it for yourself

-   Rename `config-template.json` to `config.json`
-   Update values in config (I think it might break if you dont fill in all values properly)
-   Install node.js (18 LTS is what's used here, although 20 LTS should work)
-   Install packages - `npm install`
-   Compile for typescript - `npx tsc`
-   Create new database - `node ./package/dbInit.js --force`
-   Deploy commands - `npm run deploy`
-   Run - `npm start`

## How to use

-   You can assign roles for different XP levels
-   A level 0 role represents a join role (a role which is automatically assignment upon joining)
-   You may display the top 5 users using /leaderboard
-   /rank shows the XP and level of somebody
-   Other commands have descriptions written in the slash command. They are pretty simple though.

## Suggested features for v0.4.0 which never got implemented

-   [ ] more xp for server booster(1) (multiplier)
-   [ ] /role adds a role to someone
-   [ ] add ability to disable certain channels from making you gain levels

(1) if you cannot detect if they’re boosting server, use particular role for assigning (AKA make it a global feature that you can make certain roles multiply XP
this can be enabled/disabled using similar settings system to soundbot
