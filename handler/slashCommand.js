const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9');
const { ApplicationCommand } = require('discord.js');

const token = process.env['token'];
const guild = process.env['guild'];
const application_id = process.env['application_id'];

module.exports = (client) => {

    const slashCommands = [];

    fs.readdirSync('./slashCommands/').forEach(dir => {
        const slashCommandFiles = fs.readdirSync(`./slashCommands/${dir}/`).filter(file => file.endsWith('.js'));

        for (const file of slashCommandFiles) {
            const slashCommand =require(`../slashCommands/${dir}/${file}`);
            slashCommands.push(slashCommand.data.toJSON());
            if(slashCommand.data.name) {
                client.slashCommands.set(slashCommand.data.name, slashCommand)
                console.log(file, '-Success')
            } else {
                console.log(file, '-Error')
            }
        }
    });

    const rest = new REST({ version: 9 }).setToken(token);

    (async () => {
        try{
            console.log('Start registering application commands...')

            await rest.put(
                guild
                ? Routes.applicationGuildCommands(application_id, guild)
                : Routes.applicationGuildCommands(application_id),
                {
                    body: slashCommands,
                }
            );

            console.log('Successfully registered application slash commands.')
        } catch (err) {
            console.log(err);
        }
    })();
    
}