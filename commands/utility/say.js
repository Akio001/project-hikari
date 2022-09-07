module.exports = {
    name: 'say',
    description: 'Say a message with the bot.',
    run: async(client, message, args) => {
        let msg;
        let textchannel = message.mentions.channels.first()
        message.delete
        if(!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('You do not have permission to use this command.')
        } else if(!args[0]) {
            return message.reply('Please specify what you want to say.')
        }else if(textchannel) {
            msg = args.slice(1).join(' ');
            message.channel.send(msg)
        }
    }
}