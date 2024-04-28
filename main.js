const mqtt = require('mqtt');
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

/** Bambu MQTT info */
const BAMBU = {
  printer_ip: process.env.BAMBU_IP,
  port: 8883,
  printer_serial_number: process.env.BAMBU_SERIAL,
  username: 'bblp',
  password: process.env.BAMBU_PASSWORD,
}

/** Discord bot info */
const DISCORD = {
  client_token: process.env.DISCORD_CLIENT_TOKEN,
}

// Throw an error if any of the required environment variables are missing
if (!BAMBU.printer_ip || !BAMBU.printer_serial_number || !BAMBU.username || !BAMBU.password || !DISCORD.client_token) {
  throw new Error('Missing environment variables, please copy .env.example to .env and fill in all values')
}

/** MQTT connection */


// MQTT topic is device/printer_serial_number/report
const topic = `device/${BAMBU.printer_serial_number}/report`

const protocol = 'mqtts' // For TLS
const clientId = `mqttjs_${Math.random().toString(16).substr(2, 8)}`

const connectURL = `${protocol}://${BAMBU.printer_ip}:${BAMBU.port}`

const client = mqtt.connect(connectURL, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: BAMBU.username,
  password: BAMBU.password,
  reconnectPeriod: 1000,
  rejectUnauthorized: false,
})

client.on('error', (error) => {
  console.error('connection failed', error)
})

client.on('connect', () => {
  console.log('Connected to MQTT')
  client.subscribe(topic, (err) => {
    if (err) {
      console.log('Error subscribing to topic', err)
    }
  })
})

let last_message = {}

client.on('message', (topic, message) => {
  const { print } = JSON.parse(message.toString())
  const { gcode_state, mc_percent: progress, mc_remaining_time: eta_minutes, mc_error_code: print_error_code, subtask_name: print_name } = print
  const isPrinting = gcode_state === 'RUNNING'
  last_message = {
    isPrinting,
    print_name,
    progress,
    eta_minutes,
    print_error_code,
  }
});

/** Discord bot */

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


bot.on('ready', () => {
  console.log(`Discord bot logged in as ${bot.user.tag}!`);
});

bot.login(DISCORD.client_token);

bot.on('messageCreate', (message) => {
  if (message.content === '!bambu') {
    console.log('Received command !bambu')
    const { isPrinting, print_name, progress, eta_minutes, print_error_code } = last_message
    // Add eta_minutes to current time (PST)
    const eta_date = new Date(Date.now() + eta_minutes * 60000)
    const eta_timestamp = `${eta_date.toLocaleDateString('en-US', { month: 'long' })}, ${eta_date.toLocaleTimeString('en-US')}`
    if (isPrinting) {
      message.reply(`Printing **${print_name}** ${progress}%\nETA: ${eta_minutes} minutes (**${eta_timestamp}**)${print_error_code ? `\n⚠️ *Print error code: ${print_error_code}*` : ''}`)
    } else {
      message.reply('Printer is idle')
    }
  }
});
