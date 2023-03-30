// import
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const pool = require('./models');

const app = express();
app.use(
	helmet.hsts({
		maxAge: 36000000,
	})
);
app.use(
	cors({
		origin: '*',
	})
);
app.use(express.json());

pool.connect()
	.then((client) => {
		console.log('connected');
		client.release();
	})
	.catch((err) => console.error('error connecting', err.stack))
	.then(() => pool.end());

// Route
routes(app);

app.listen(process.env.PORT || 8080, () => {
	console.log(`Server is running on port http://localhost:${process.env.PORT || 8080}`);
});
