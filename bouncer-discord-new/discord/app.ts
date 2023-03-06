import { URLSearchParams } from "url";
import {
  Intents,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel,
  ButtonInteraction,
} from "discord.js";
import { Client } from "discordx";
import { dirname, importx } from "@discordx/importer";

import { getAllProjects } from "@0xkomada/bouncer-db";
import { dbConn } from "../db/mongodb/mongodb.js";
import { AddRoleData } from "../types/discord.js";
import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import {
  generateSessionId,
  setUserSessionCache,
} from "../db/redis/access/session.js";

import { SESSION_KEY_NAME } from "../db/redis/access/session.js";
import { subRedisClient } from "../db/redis/redis.js";

export class DiscordClient {
  client: any;
  interactionMap: Map<string, ButtonInteraction>;

  constructor() {
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });

    this.interactionMap = new Map<string, ButtonInteraction>();

    this.client.on("ready", async () => {
      genericLogger.info("Discord bot: ready");

      await this.client.initApplicationCommands();
      await this.client.initApplicationPermissions();

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("cta")
          .setLabel("Let's go!")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setLabel("Docs")
          .setURL(config.DISCORD_DOC_LINK!)
          .setStyle("LINK")
      );

      const projects = await getAllProjects(dbConn);

      for (const project of projects) {
        const guildId = project.discordGuildId;
        const channelId = project.discordChannelId;

        const channel = this.client.channels.cache.find(
          (channel) => channel.id === channelId && channel.guildId === guildId
        ) as TextChannel;

        // Delete previous messages
        channel.bulkDelete(1);

        const msg = new MessageEmbed()
          .setTitle("Verify your assets")
          .setDescription(
            "You only have to sign a message to verify ownership.\nYou do not have to pay any gas fees.\nDo not share your seed phrase or approve any transactions."
          )
          .setThumbnail(
            "https://lh3.googleusercontent.com/h4ZgBr_aaCkXgTWedbOm4tT21BM3aK_IbL83qo22x5Dpn3iAiel9gSIqLAJNo3ZGRY5dDiqIjYPcilkvkzIxjnL2o-ZlKUdlmuKGTu0=w600"
          );

        await channel.send({
          embeds: [msg],
          components: [row],
        });

        const collector = channel.createMessageComponentCollector({
          componentType: "BUTTON",
        });

        collector.on("collect", async (interaction) => {
          const guildId = interaction.guildId;
          const userId = interaction.user.id;

          const paramsObj = new URLSearchParams();

          this.interactionMap.set(userId, interaction);

          const sessionKey = generateSessionId();
          paramsObj.set("nonce", sessionKey);

          await setUserSessionCache(sessionKey, userId, guildId!);

          const params = paramsObj.toString();

          const msg = new MessageEmbed()
            .setTitle("Verify Your Assets")
            .setDescription(
              "Use this custom link to connect (valid for 5 minutes)"
            );

          const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel("Connect Wallet")
              .setURL(`${config.FE_URL!}/?${params}`)
              .setStyle("LINK")
          );

          await interaction.reply({
            embeds: [msg],
            components: [row],
            ephemeral: true,
          });

          genericLogger.info(
            `join command: guildId - ${guildId} userId - ${userId}`
          );
        });
      }
    });

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) {
        return;
      }

      await this.client.executeInteraction(interaction);
    });
  }

  start = async () => {
    await importx(
      dirname(import.meta.url) + "/{events,commands,api}/**/*.{ts,js}"
    );

    await this.client.login(config.DISCORD_CLIENT_TOKEN!);
  };

  // Wrapper for discord client emit
  emit = async (action: any, data: any) => {
    await this.client.emit(action, data);
  };

  deleteInteraction = async (userId: string) => {
    this.interactionMap.delete(userId);
  };

  addUserToProject = async (data: AddRoleData) => {
    try {
      const { guildId, userId, roleId } = data;
      const guild = await this.client.guilds.fetch(guildId);
      const guildMember = await guild.members.fetch(userId);
      const guildRole = await guild.roles.fetch(roleId);
      if (guildRole === null) {
        throw new Error("No guild role found");
      }

      await guildMember.roles.add(guildRole);

      const interaction = this.interactionMap.get(userId);

      // Session expired
      if (interaction === undefined) {
        const err = new Error("Session expired");
        genericLogger.warn(`addUserToProject error: ${err}`);

        throw err;
      } else {
        await interaction.followUp({
          content: `Congrats ${guildMember.user.username}, you are now a ${guildRole.name}!`,
          ephemeral: true,
        });

        this.deleteInteraction(userId);
      }
    } catch (err) {
      genericLogger.error(`addUserToProject error: ${err}`);

      throw err;
    }
  };

  // Note: Moved here due to import problems
  subKeyExpiry = async () => {
    subRedisClient.subscribe("__keyevent@0__:expired", (key) => {
      const userId = key.replace(SESSION_KEY_NAME, "");
      this.deleteInteraction(userId);
      genericLogger.warn(`Redis: key ${userId} expired`);
    });

    genericLogger.info(`subKeyExpiry: listening`);
  };
}
