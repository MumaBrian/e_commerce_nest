export default () => ({
	database: {
		type: process.env.DB_TYPE || 'mysql',
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT, 10) || 3306,
		username: process.env.DB_USERNAME || 'root',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_NAME || 'ecommerce',
	},
	jwt: {
		secret: process.env.JWT_SECRET || 'secretKey',
		expiresIn: process.env.JWT_EXPIRES_IN || '60s',
	},
	mailgun: {
		apiKey: process.env.MAILGUN_API_KEY,
		domain: process.env.MAILGUN_DOMAIN,
	},
});
