const app = require('./app');
const port = 8090;

app.listen(port, () => console.log(`Application hosted at http://127.0.0.1:${port}/ `));
