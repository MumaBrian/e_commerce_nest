export default () => ({
	database: {
		type: process.env.DB_TYPE || 'mysql',
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT, 10) || 3306,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN,
	},
	cors: { origin: process.env.CORS_ORIGINS },
	port: parseInt(process.env.PORT, 10),
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		port: parseInt(process.env.REDIS_PORT, 10) || 6379,
		password: process.env.REDIS_PASSWORD,
		ttl: parseInt(process.env.REDIS_TTL, 10),
	},
	email: {
		host: process.env.EMAIL_HOST,
		subject: process.env.EMAIL_SUBJECT,
		text: process.env.TEXT,
		html: process.env.HTML,
		port: process.env.EMAIL_PORT,
		password: process.env.EMAIL_PASSWORD,
		user: process.env.EMAIL_USER,
	},
	google: {
		client_id: process.env.GOOGLE_CLIENT_ID,
		client_secret: process.env.GOOGLE_CLIENT_SECRET,
		call_back_url: process.env.GOOGLE_CALLBACK_URL,
	},
});
