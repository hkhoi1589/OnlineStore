const connection = require('./index');

const getProductAttributes = async (productId) => {
	const query = `select attribute_name as key, attribute_value as value 
                    from ProductAttribute
                    where product_id = $1`;
	const out = await connection.query(query, [productId]);
	return out.rows;
};

const getVariantAttributes = async (productId) => {
	const query = `select variant_id, attribute_name as key, attribute_value as value
                    from VariantAttribute natural join Variant
                    where product_id = $1`;
	const out = await connection.query(query, [productId]);
	return out.rows;
};

// chua lam req.customerID
const getProduct = async (productId) => {
	const query = `select product_id, title, description, weight_kilos, brand 
                            from Product
                            where product_id = $1`;
	const out = await connection.query(query, [productId]);

	if (out.rows.length === 0) throw Error('No such product');
	const result = out.rows[0];

	// Add record
	//await connection.query('CALL addVisitedRecord($1, $2)', [req.customerID, productId]);

	result.attributes = await getProductAttributes(productId);
	return result;
};

// !tag && !category
const getProductsFromAllCategoriesPerPage = async (numPerPage, skip, order, min, max) => {
	const query =
		order === 'asc'
			? `select * from ProductBasicView 
	where min_selling_price between $3 and $4
	order by min_selling_price asc
	limit $1 offset $2`
			: `select * from ProductBasicView 
	where min_selling_price between $3 and $4
	order by min_selling_price desc
	limit $1 offset $2`;
	const values = [numPerPage, skip, min, max];

	const out = await connection.query(query, values);

	const result = out.rows.map((el) => {
		const o = { ...el };
		o.id = o.product_id;
		o.show = true;
		o.price = o.min_selling_price - 0;
		o.image = o.image_url;
		return o;
	});
	return { result };
};
const getProductsFromAllCategories = async (min, max) => {
	const query = `select * from ProductBasicView
	where min_selling_price between $1 and $2`;

	const values = [min, max];

	const out = await connection.query(query, values);
	const result = out.rows.map((el) => {
		const o = { ...el };
		o.id = o.product_id;
		o.show = true;
		o.price = o.min_selling_price - 0;
		o.image = o.image_url;
		return o;
	});
	return {
		result,
	};
};

// !tag
const getProductsFromCategoriesPerPage = async (numPerPage, skip, category, order, min, max) => {
	const query =
		order === 'asc'
			? `select * from ProductBasicView 
			natural join ProductCategory
			where category_id = $3
			and min_selling_price between $4 and $5
			order by min_selling_price asc
			limit $1 offset $2`
			: `select * from ProductBasicView 
			natural join ProductCategory 
			where category_id = $3
			and min_selling_price between $4 and $5
			order by min_selling_price desc
			limit $1 offset $2`;

	const values = [numPerPage, skip, category, min, max];

	const out = await connection.query(query, values);
	const result = out.rows.map((el) => {
		const o = { ...el };
		o.id = o.product_id;
		o.show = true;
		o.price = o.min_selling_price - 0;
		o.image = o.image_url;
		return o;
	});
	return { result };
};
const getProductsFromCategories = async (categoryId, min, max) => {
	const query = `select * from ProductBasicView
	natural join ProductCategory
	where category_id = $1
	and min_selling_price between $2 and $3`;

	const values = [categoryId, min, max];

	const out = await connection.query(query, values);

	const result = out.rows.map((el) => {
		const o = { ...el };
		o.id = o.product_id;
		o.show = true;
		o.price = o.min_selling_price - 0;
		o.image = o.image_url;
		return o;
	});
	return {
		result,
	};
};

// !category
const getProductsFromQuery = async (searchQuery) => {
	const query = `select product_id, title, min_selling_price, image_url,description 
                            from ProductBasicView natural left outer join ProductTag
                            where tag_id in (select tag_id from tag where tag like $1) or lower(title) like lower($1)
                            group by product_id, title, min_selling_price, image_url,description
                            order by min_selling_price 
                            limit 99`;
	const values = [
		`%${searchQuery
			.replace('!', '!!')
			.replace('%', '!%')
			.replace('_', '!_')
			.replace('[', '![')}%`,
	];

	const out = await connection.query(query, values);
	const result = out.rows.map((el) => {
		const o = { ...el };
		o.id = o.product_id;
		o.show = true;
		o.price = o.min_selling_price - 0;
		o.image = o.image_url;
		return o;
	});
	return { result, topprice: result.length === 0 ? 10000 : result[result.length - 1].price };
};

const getRelatedProducts = async (productId, limit) => {
	const query = `select ProductBasicView.product_id, 
                        ProductBasicView.title, 
                        ProductBasicView.min_selling_price, 
                        ProductBasicView.image_url
                    from ProductBasicView, ProductCategory as child, ProductCategory as parent
                    where parent.product_id = $1 and 
                            parent.category_id = child.category_id and
                            parent.category_id not in (select distinct on (parent_id) parent_id from category where parent_id is not null) and
                            child.product_id = ProductBasicView.product_id and
                            ProductBasicView.product_id != $1
                    limit $2;`;
	const values = [productId, limit];
	const out = await connection.query(query, values);
	return out.rows;
};

const getRecentProducts = async (limit) => {
	const query = `select *
                    from ProductBasicView natural join Product
                    order by added_date desc
                    limit $1;`;
	const out = await connection.query(query, [limit]);
	return out.rows;
};

const getVariants = async (productId) => {
	const query = `select variant_id, quantity, title, selling_price, listed_price
                            from Variant
                            where product_id = $1`;
	const out = await connection.query(query, [productId]);
	const result = out.rows.map((el) => {
		const o = { ...el };
		o.id = o.variant_id;
		o.price = o.selling_price - 0;
		o.old_price = o.listed_price;
		o.amount = o.quantity;
		return o;
	});

	const attributes = await getVariantAttributes(productId);
	return { result, attributes };
};

const recentProducts = async (customerID) => {
	const queryString = `select * from (
                            select distinct on (product_id) product_id, min_selling_price, title, image_url, visited_date
                                from productbasicview natural join visitedproduct natural
                            where customer_id = $1
                            ) as tbl order by visited_date desc limit 10`;
	const values = [customerID];
	const out = await connection.query(queryString, values);
	return out.rows;
};

module.exports = {
	getProduct,
	getVariants,
	getRelatedProducts,
	getRecentProducts,
	getProductsFromAllCategoriesPerPage,
	getProductsFromAllCategories,
	getProductsFromCategories,
	getProductsFromCategoriesPerPage,
	getProductsFromQuery,
	recentProducts,
};
