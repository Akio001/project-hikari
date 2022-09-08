const Discord = require("discord.js")
const { Client, Message, MessageEmbed, Collection } = require('discord.js')
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")
const config = require('./config.json')
const client = new Client({
    partials: ["MESSAGE", "CHANNEL", "REACTIONS"],
    intents: [
        32767,
        "Guilds",
        "GuildVoiceStates"
    ]
});


const prefix = config.prefix


dotenv.config()
const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load"

const CLIENT_ID = "1015902101139894334"
const GUILD_ID = "976702826573094963"


client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

let commands = []

const slashFiles = fs.readdirSync("./slashCommands/Music").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
    const slashcmd = require(`./slashCommands/Music/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

if (LOAD_SLASH) {
    const rest = new REST({ version: "9" }).setToken(TOKEN)
    console.log("Deploying slash commands")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
}
else {
    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid slash command")

            await interaction.deferReply()
            await slashcmd.run({ client, interaction })
        }
        handleCommand()
    })
}

client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();

client.categories = fs.readdirSync('./commands');


['command'].forEach((handLer) => {
    require(`./handler/${handLer}`)(client)
});

client.slashCommands = new Collection();

['slashCommand'].forEach((handLer) => {
    require(`./handler/${handLer}`)(client)
});



client.on("ready", () => {
    console.log(`${client.user.tag} is online.`)
    client.user.setActivity(`${prefix}help | Under Development | ${client.guilds.cache.size} servers`)
});

client.login(TOKEN)
