require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/category/:type', (req, res) => {
    const type = req.params.type;
    res.render('category', { type });
});

app.listen(PORT, () => {
    console.log(`JUNFLIXTV running on http://localhost:${PORT}`);
});
