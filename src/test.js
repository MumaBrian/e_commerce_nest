const bcrypt = require('bcrypt');

const storedHash =
	'$2b$10$iF5gCCitlsZI2Rm4AcED9.fAMPMaYXe80rKH.LnY5ppoTgasES7OC'; // example stored hash
const plainTextPassword = '675113774Mba?'; // replace with actual password to compare

bcrypt.compare(plainTextPassword, storedHash, (err, result) => {
	if (err) {
		console.error('Error comparing passwords:', err);
	} else {
		console.log('Password match:', result); // should print true if passwords match
	}
});
