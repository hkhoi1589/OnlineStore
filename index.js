// import
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');

dotenv.config();

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

// Route
routes(app);

app.listen(process.env.PORT || 8080, () => {
	console.log(`Server is running on port http://localhost:${process.env.PORT || 8080}`);
});
