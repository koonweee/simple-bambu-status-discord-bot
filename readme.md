# Simple Bambu status Discord bot
Sets up a MQTT connection to the Bambu printer, polls it for status updates and forwards them to Discord whenever `!bambu` is issued. Made for use at [Noisebridge SF](https://www.noisebridge.net/wiki/Noisebridge).

![example](https://github.com/koonweee/simple-bambu-status-discord-bot/blob/main/docs/images/Screenshot%202024-04-27%20at%206.50.25%E2%80%AFPM.png?raw=true)
## Setup instructions
1. Clone the repo
2. Do `yarn install` to install all dependencies
3. Copy `.env.example`, rename copy to `.env`, and fill in variables in `.env`
4. Do `yarn start` to start the bot
5. Enjoy

## References
* [How to get a Discord bot token](https://www.writebots.com/discord-bot-token/)
* [Build a Discord bot with Node.js](https://www.codecademy.com/article/build-a-discord-bot-with-node-js)
