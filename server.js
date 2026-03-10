const knex = require('./src/database/');
const express = require('express');
const cors = require('cors');

const app = express();

const PORT = 3333;
app.use(cors());
app.use(express.json());
app.listen(PORT, ()=> console.log(`Servidor rodando da porta ${PORT}`));

app.get('/', (req, res) => {
    return res.json('Hello World');
});