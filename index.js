require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const voiceStateUpdate = require("./events/voiceStateUpdate");

const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
  Events,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.modcallMessages = new Map();

/* Load commands */
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  for (const file of fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".js"))) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
  }
}

/* Load events */
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  for (const file of fs
    .readdirSync(eventsPath)
    .filter((f) => f.endsWith(".js"))) {
    const ev = require(path.join(eventsPath, file));
    if (ev.once) client.once(ev.name, (...args) => ev.execute(...args, client));
    else client.on(ev.name, (...args) => ev.execute(...args, client));
  }
}

/* MongoDB connection */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => {
    console.error("MongoDB connect failed!", err);
    process.exit(1);
  });

/* Private VC */
client.on("voiceStateUpdate", (oldState, newState) =>
  voiceStateUpdate.execute(client, oldState, newState)
);

/* Bot login */
client.login(process.env.DISCORD_TOKEN);
