require('dotenv').config();
const express = require("express")
const cors = require("cors");
const dbConnect = require("./config/mongo");

const app = express()

//Le decimos a la app de express() que use cors para evitar el error Cross-Domain (XD)
app.use(cors())
app.use(express.json())
app.use(express.static("storage"))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/client', require('./routes/client'));
app.use('/api/project', require('./routes/project'));
app.use('/api/deliverynote', require('./routes/deliverynote'));

const swaggerDocs = require('./swagger');
swaggerDocs(app);


const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Servidor escuchando en el puerto " + port)
    dbConnect();
})

