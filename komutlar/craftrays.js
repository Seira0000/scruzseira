const axios = require('axios');
const fs = require('fs');

exports.run = async (client, message, args) => {
    if (args.length === 0) {
        return message.reply('Lütfen taratmak istediğiniz ismi girin.');
    }

    const parameter = args.join(' '); // Kullanıcı tarafından girilen tüm argümanları al
    const apiUrl = `https://crp-pink.vercel.app/api/search?keyword=${parameter}`;

    try {
        // API'den ham veri çekme
        const response = await axios.get(apiUrl);
        const rawData = JSON.stringify(response.data, null, 2); // Ham veriyi JSON formatında stringe çevir

        // Ham veriyi 'user.txt' dosyasına kaydetme
        const fileName = 'user.txt';
        fs.writeFileSync(fileName, rawData);

        // Dosyayı Discord kanalına gönderme
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