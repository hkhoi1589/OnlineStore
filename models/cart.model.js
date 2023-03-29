const connection = require('./index');

const getCartItems = async (customerID) => {
	const query = `select cart_item_id as id,
                        variant_id as variant_id, 
                        CartItem.quantity as quantity, 
                        cart_item_status,
                        image_url as image,
                        Variant.title as variant, 
                        Product.title as product, 
                        Product.product_id as productid,
                        selling_price as unitprice
                    from 
                        Customer natural join 
                        CartItem join Variant using(variant_id) natural join
                        ProductMainImageView join Product using(product_id) 
                    where 
						customer_id = $1 and
                        (cart_item_status='added' or cart_item_status='transferred')`;
	const out = await connection.query(query, [customerID]);
	let subtotal = 0;
	out.rows.forEach((v) => {
		if (v.cart_item_status === 'added') {
			v.totalprice = v.unitprice * v.quantity;
			subtotal += v.totalprice;
		}
	});
	return {
		cartItems: out.rows,
		subtotal,
	};
};

const countCartItems = async (customerID) => {
	const query = `select count(*) as count
                    from cartitem 
                    where customer_id=$1 and cart_item_status='added'`;
	const values = [customerID];
	const out = await connection.query(query, values);
	return out.rows[0].count - 0;
};

const addItemToCart = async (variantId, qty, customerID) => {
	const query = 'CALL addItemToCart($1, $2, $3)';
	const values = [customerID, variantId, qty];
	try {
		await connection.query(query, values);
	} catch (err) {
		return err;
	}
	return null;
};

const removeItemFromCart = async (customerID, cartItemId) => {
	const query = 'CALL removeCartItem($1, $2)';
	const values = [customerID, cartItemId];
	await connection.query(query, values);
};

const editCartItemQuantity = async (customerID, cartItemId, newQuantity) => {
	const query = 'CALL changeCartItemQuantity($1, $2, $3)';
	const values = [customerID, cartItemId, newQuantity];
	try {
		await connection.query(query, values);
	} catch (err) {
		return err;
	}
	return null;
};

const transferCartItem = async (customerID, cartItemId) => {
	const query = 'CALL transferCartItem($1, $2)';
	const values = [customerID, cartItemId];
	try {
		await connection.query(query, values);
	} catch (err) {
		return err;
	}
	return null;
};

const checkStock = async (customerID) => {
	const queryString = 'CALL checkAvailability($1)';
	const values = [customerID];
	try {
		await connection.query(queryString, values);
	} catch (err) {
		return err;
	}
	return null;
};

const proceedCheckOut = async (customerID, loggedIn) => {
	const productDetailsObject = {
		delivery_info: { delivery_charge: 0, delivery_days: 'unknown' },
	};
	let result;
	if (loggedIn) {
		const userInfoQueryString = `SELECT email, first_name, last_name, 
                                            addr_line1, addr_line2, city, 
                                            postcode, phone_number,
                                            delivery_days, delivery_charge 
                                        from UserDeliveryView 
                                        where UserDeliveryView.customer_id = $1`;
		const userInfoValues = [customerID];
		result = await connection.query(userInfoQueryString, userInfoValues);
		[productDetailsObject.delivery_info] = result.rows;
	}

	const itemsInfoQueryString = `SELECT variant_id, product_id, quantity, 
                                        variant_title, selling_price, product_title 
                                    from ProductVariantView 
                                    where ProductVariantView.customer_id = $1`;
	const itemInfoValues = [customerID];
	result = await connection.query(itemsInfoQueryString, itemInfoValues);
	productDetailsObject.items = result.rows;
	productDetailsObject.subtotal = 0;
	productDetailsObject.items.forEach((v) => {
		// eslint-disable-next-line no-param-reassign
		v.totalprice = (v.selling_price - 0) * (v.quantity - 0);
		productDetailsObject.subtotal += v.totalprice;
	});
	return productDetailsObject;
};

module.exports = {
	getCartItems,
	removeItemFromCart,
	addItemToCart,
	transferCartItem,
	checkStock,
	proceedCheckOut,
	editCartItemQuantity,
	countCartItems,
};
