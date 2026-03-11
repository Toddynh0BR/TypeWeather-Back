const express = require('express');//Gerenciador do Servidor
const cron = require('node-cron');//Agendamento de Funções
const dotenv = require('dotenv')//Variáveis de Ambiente
const cors = require('cors');//Segurança de Rede

const knex = require('./src/database/');//Gerenciador de Database
const app = express();//Aplicação Back-End

dotenv.config();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.listen(PORT, ()=> console.log(`Servidor rodando da porta ${PORT}`));

const sendNotification = require('./src/services/sendNotifications');//Enviar notificações
const getWeather = require('./src/services/getWeather');//Buscar clima

app.get('/', (req, res) => {
    return res.json('Hello World');
});//Hello World

app.post("/ping", (req, res) => {
  console.log("Keep-alive recebido:", new Date().toISOString());
  return res.status(200).json({ ok: true });
});//Ping para manter server ativo

app.post('/token/add', async (req, res) => {
    const { token, cidade, lat, lon } = req.body;
    console.log('Informações de token recebidas');

    if (!token) throw new Error('Token não recebido');

    console.log('Token e cidade recebidos:', token, cidade, lat, lon);
    try {
      const TokenExist = await knex('tokens')
                              .where({ token })
                              .first();

      if (TokenExist) return res.status(409).json({ message: 'Token já existe' });

      await knex('tokens').insert({
        token,
        cidade,
        lat,
        lon
      });

      return res.status(201).json({ message: 'Token cadastrado com sucesso!' });
    } catch(error) {
      console.error('Erro ao cadastrar token:', error.message || error);
      return res.status(500).json({ message: 'Erro ao cadastrar token' });
    };
});//Adição de token

app.put('/token/update', async (req, res)=> {
    const { token, cidade, recebe, lat, lon } = req.body;

    if (!token) throw new Error('Informações ausentes');

    console.log('Editando informações de token:', cidade, recebe, lat, lon);

    try {
      const Token = await knex('tokens')
                         .where({ token })
                         .first();

      if (!Token) return res.status(404).json({ message: 'Token não encontrado' });

      await knex('tokens')
           .where({ token })
           .update({
            cidade: cidade || Token.cidade,
            recebe: recebe ?? Token.recebe,
            lat: lat || Token.lat,
            lon: lon || Token.lon
           });

      return res.status(200).json({ message: 'Token atualizado com sucesso!'});
    } catch (error) {
      console.error('Erro ao atualizar token:', error.message || error);
      return res.status(500).json({ message: 'Erro do servidor ao atualizar token.'});
    };
});//Atualização de token

cron.schedule('0 7 * * *', async () => {
  console.log('Iniciando envio de notificações');

  try {
    const tokens = await knex('tokens')
                        .where({ recebe: true })
                        .whereNotNull('lat')
                        .whereNotNull('lon')
                        .whereNot('lat', '')
                        .whereNot('lon', '');

    console.log('Tokens:', tokens)
    if (!tokens.length) return console.log('Nenhum token cadastrado ainda.');

    const map = new Map();

    tokens.forEach(item => {
      if (!map.has(item.cidade)) {
        map.set(item.cidade, {
          cidade: item.cidade,
          tokens: [],
          lat: item.lat,
          lon: item.lon
        });
      }

      map.get(item.cidade).tokens.push(item.token);
    });

    const resultado = [...map.values()];
    console.log('Resultado:', resultado)

    await Promise.all(
      resultado.map(async cidade => {
        const clima = await getWeather(cidade.lat, cidade.lon);

        if (!clima) return;

        const climaDescription = 
`🌥️Tempo ${clima.current.weather[0].description} com temperatura de ${Math.trunc(clima.current.temp).toString()}ºc.\n 🌧️Probalidade de chuva: ${Math.round(clima.daily[0].pop * 100)}%,\n 💧Umidade do ar: ${clima.current.humidity}%,\n 🌬️Velocidade do vento: ${Math.round(clima.current.wind_speed * 3.6)}km/h.`
   
        await Promise.all(
          cidade.tokens.map(token =>
            sendNotification(token, {
              title: cidade.cidade,
              body: climaDescription,
              data: {
                screen: "result",
                lat: cidade.lat,
                lon: cidade.lon
              }
            })
          )
        );

      })

    );

  } catch (error) {
    console.error("Erro ao enviar notificações:", error);
  }
});//Envio de notificações diariamente




