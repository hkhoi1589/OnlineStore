const connection = require('./index');
const { comparePassword } = require('../helpers');

const createUser = async (
	email,
	firstName,
	lastName,
	addressLine1,
	addressLine2,
	city,
	postalCode,
	birthday,
	password,
	telephoneNumber,
	avatar
) => {
	const queryString = 'CALL createUser($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)';
	const values = [
		email,
		firstName,
		lastName,
		addressLine1,
		addressLine2,
		city,
		postalCode,
		birthday,
		password,
		telephoneNumber,
		avatar,
	];
	await connection.query(queryString, values);
	return true;
};

const updateUser = async (
	customerID,
	email,
	firstName,
	lastName,
	addr_line1,
	addr_line2,
	city,
	postcode,
	birthday,
	password,
	telephoneNumber,
	avatar
) => {
	const queryString = 'CALL updateUser($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)';
	const values = [
		customerID,
		email,
		firstName,
		lastName,
		addr_line1,
		addr_line2,
		city,
		postcode,
		birthday,
		password,
		telephoneNumber,
		avatar,
	];
	await connection.query(queryString, values);
	return true;
};

const updateUserWithoutPass = async (
	customerID,
	email,
	firstName,
	lastName,
	addr_line1,
	addr_line2,
	city,
	postcode,
	birthday,
	telephoneNumber,
	avatar
) => {
	const queryString = 'CALL updateUserWithoutPass($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)';
	const values = [
		customerID,
		email,
		firstName,
		lastName,
		addr_line1,
		addr_line2,
		city,
		postcode,
		birthday,
		telephoneNumber,
		avatar,
	];
	console.log('updateUserWithoutPass', values);
	await connection.query(queryString, values);
	return true;
};

const validatePassword = async (email, password) => {
	const queryString = `select customer_id, account_type, email, (first_name || ' ' || last_name) as name, 
						password, addr_line1, addr_line2, city, postcode, dob, avatar
                        from userinformation join customer using(customer_id) join accountcredential using(customer_id)
                        where userinformation.email = $1`;
	const values = [email];
	const out = await connection.query(queryString, values);
	if (out.rows[0]) {
		const validPassword = await comparePassword(password, out.rows[0].password);
		if (out.rows[0] && validPassword) {
			return out.rows[0];
		}
	}

	return false;
};

const FindEmail = async (email) => {
	const queryString = `select customer_id, account_type, email, (first_name || ' ' || last_name) as name, 
						addr_line1, addr_line2, city, postcode, dob, avatar
						from userinformation join customer using(customer_id) where email = $1`;
	const values = [email];
	const out = await connection.query(queryString, values);
	return out.rows[0];
};

const UserInfo = async (customerID) => {
	const queryString = `select customer_id, account_type, email, (first_name || ' ' || last_name) as name, 
						addr_line1, addr_line2, city, postcode, dob, avatar
                        from userinformation join customer using(customer_id)
                        where customer_id = $1`;
	const values = [customerID];
	const out = await pool.query(queryString, values);
	return out.rows[0];
};

const UserType = async (customer_id) => {
	const queryString = `select account_type
                            from customer 
                            where customer_id=$1`;
	const values = [customer_id];
	const out = await connection.query(queryString, values);
	return out.rows[0].account_type;
};

module.exports = {
	createUser,
	updateUser,
	updateUserWithoutPass,
	validatePassword,
	FindEmail,
	UserInfo,
	UserType,
};
