const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { sendLogGreggs } = require("../utils/logger");
const config = require("../config/config.json");

const filePath = path.join(__dirname, "../data/whitelistGreggs.json");

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("greggs")
    .setDescription("Greggs whitelist")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add user to whitelist")
        .addStringOption((opt) =>
          opt
            .setName("username")
            .setDescription("Roblox username")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove from whitelist")
        .addStringOption((opt) =>
          opt
            .setName("username")
            .setDescription("Roblox username")
            .setRequired(true)
        )
    ),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.GREGGS_WHITELIST_ROLE_ID)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `<:x_:1416742077286584431> You need <@&${config.GREGGS_WHITELIST_ROLE_ID}> role to run this command`
            )
            .setColor("Red"),
        ],
      });
    }
    const subcommand = interaction.options.getSubcommand();
    const username = interaction.options.getString("username");
    const whitelist = JSON.parse(fs.readFileSync(filePath));

    if (subcommand === "add") {
      if (whitelist.includes(username))
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:x_:1416742077286584431> ${username} Provided player is already on whitelist`
              )
              .setColor("Red"),
          ],
        });
      whitelist.push(username);
      fs.writeFileSync(filePath, JSON.stringify(whitelist, null, 2));
      await sendLogGreggs(
        interaction.client,
        "ADD",
        username,
        interaction.user
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `<:tick:1416742042700353546> ${username} has been added to whitelist`
            )
            .setColor("Green"),
        ],
      });
    } else if (subcommand === "remove") {
      if (!whitelist.includes(username))
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:x_:1416742077286584431> ${username} is not on whitelist`
              )
              .setColor("Red"),
          ],
        });
      const index = whitelist.indexOf(username);
      whitelist.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(whitelist, null, 2));
      await sendLogGreggs(
        interaction.client,
        "REMOVE",
        username,
        interaction.user
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `<:tick:1416742042700353546> ${username} has been removed from whitelist`
            )
            .setColor("Green"),
        ],
      });
    }
  },
};
