const axios = require('axios');
const fs = require('fs');

exports.run = async (client, message, args) => {
    if (args.length === 0) {
        return message.reply('Lütfen taratmak istediğiniz ismi girin.');
    }

    const parameter = args.join(' '); // Api
    const apiUrl = `https://crp-pink.vercel.app/api/search?keyword=${parameter}`;

    try {
        // get raw on api
        const response = await axios.get(apiUrl);
        const rawData = JSON.stringify(response.data, null, 2); // raw to json

        // get txt
        const fileName = 'user.txt';
        fs.writeFileSync(fileName, rawData);

        // send txt
        await message.channel.send({
            content: `**${parameter}** kullanıcısına ait bilgiler:`,
            files: [{
                attachment: fileName,
                name: fileName
            }]
        });

    } catch (error) {
        console.error('Hata:', error);
        message.reply('API\'de bir sorun mevcut veya geçersiz bir kullanıcı adı girdiniz!');
    }
};

exports.conf = {
    aliases: ['tarat', 'search'],
    permLevel: 0,
    kategori: 'Sahip'
};

exports.help = {
    name: 'tarat',
    description: 'Belirttiğiniz kullanıcı adını API\'de aratır ve sonuçları .txt dosyası olarak gönderir.',
    usage: '!tarat <kullanıcı adı>'
};