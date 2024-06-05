const express = require('express');
const path = require('path');
const { saveHackerNewsArticles, saveTop10Articles } = require('./index');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', async (req, res) => {
    await saveHackerNewsArticles();
    await saveTop10Articles('score');
    await saveTop10Articles('comments');
    res.sendFile(__dirname + '/index.html')
})
  
app.listen(port, () => {
    console.log(`App up on http://localhost:${port}`)
})