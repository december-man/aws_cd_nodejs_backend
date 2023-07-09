-- Aliaksei's not-so-black market data filler

-- Task 4

-- DML part (inserting data)
-- Writing A function to add data based on the user input:

DROP FUNCTION IF EXISTS insert_data(TEXT, TEXT, INT, INT); -- debugging

CREATE OR REPLACE FUNCTION insert_data(
IN	product_title TEXT, description TEXT, price INTEGER, "count" INTEGER
) RETURNS VOID
AS $$
DECLARE
id_tmp uuid;
BEGIN
	IF NOT EXISTS (SELECT 1 FROM products WHERE UPPER(product_title) = UPPER(title)) THEN
		EXECUTE 
			'INSERT INTO products (title, description, price)
				SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT * FROM products WHERE UPPER(title) = UPPER($1))
			 RETURNING id;' INTO id_tmp USING product_title, description, price;
		EXECUTE
			'INSERT INTO stocks (product_id, count)
				SELECT $1, $2 WHERE NOT EXISTS (SELECT product_id FROM stocks WHERE product_id = $1);' USING id_tmp, count;
	ELSE 
		RAISE EXCEPTION '% is already in the products table!', UPPER(product_title);
	END IF;
END; 
$$ 	LANGUAGE plpgsql VOLATILE;


SELECT * FROM insert_data('Mock Data Generator EVO 1', 'Perfect for cases like this!', 100, 2);
SELECT * FROM insert_data('Mock Data Generator EVO 2', 'Perfect for cases like this!', 200, 5);
SELECT * FROM insert_data('Mock Data Generator EVO 3', 'Perfect for cases like this!', 300, 7);
SELECT * FROM insert_data('Fake UUID Generator v2.1 beta', 'Perfect to mess with databases, as it contains duplicates!', 50, 398);
SELECT * FROM insert_data('In Noise We Trust model X', 'ML model that substitutes input data with gaussian noise', 125, 14);
SELECT * FROM insert_data('PostgreSQL', 'Its not free anymore', 25, 763);
SELECT * FROM insert_data('5G muffler extreme', '5G is going to kill us all!', 500, 3);
SELECT * FROM insert_data('Its raining men', 'Hallelujah', 666, 1);
SELECT * FROM insert_data('ETH smart contract backdoors', 'Vitalik cannot be trusted', 666, 1);
SELECT * FROM insert_data('Faraday Cage', 'Portable version!', 15, 560);
SELECT * FROM insert_data('Tesla Model X bluetooth hijack kit', 'Easy prey!', 422, 11);

-- Task 8

-- Filling cartApi tables

-- Create users function / DML

DROP FUNCTION IF EXISTS create_user(VARCHAR, VARCHAR, VARCHAR) -- debugging purposes

CREATE OR REPLACE FUNCTION create_user(
	IN user_name VARCHAR, email_addr VARCHAR, pass VARCHAR
) RETURNS VOID
AS $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM users WHERE UPPER("name") = UPPER(user_name)) THEN
		EXECUTE 
			'INSERT INTO users ("name", email, password)
				SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT * FROM users WHERE UPPER("name") = UPPER($1))
			 RETURNING *;' USING user_name, email_addr, MD5(pass);
	ELSE 
		RAISE EXCEPTION '% is already exists in the database!', UPPER(user_name);
	END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

SELECT * FROM create_user('Petrovich', 'klyuchna30@mail.ru', 'TEST_PASSWORD');
SELECT * FROM create_user('All Seeing Eye', 'bigbrother@iswatching.by', 'IVE_SEEN_FOOTAGE');
SELECT * FROM users;

-- Populate carts & carts items
-- Carts are created upon adding the first item, after then it gets updated with the new ones.

DROP FUNCTION IF EXISTS create_cart(UUID, VARCHAR, UUID, INTEGER) -- debugging purposes

CREATE OR REPLACE FUNCTION create_cart(
	IN userid UUID, product UUID, "count" INTEGER
) RETURNS VOID
AS $$
DECLARE
id_tmp uuid;
BEGIN
	IF NOT EXISTS (SELECT 1 FROM carts WHERE user_id = $1) THEN
		EXECUTE 
			'INSERT INTO carts (user_id)
				SELECT $1 WHERE NOT EXISTS (SELECT * FROM carts WHERE user_id = $1 AND status = ' || quote_literal('OPEN') || ')
			 RETURNING id;' INTO id_tmp USING userid;
		EXECUTE
			'INSERT INTO cart_items (cart_id, product_id, count)
				SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT product_id FROM cart_items WHERE cart_id = $1 AND product_id = $2);'
			USING id_tmp, product, "count";
	ELSE 
		RAISE EXCEPTION 'cart with the following id: % is already exists in the database!', UPPER(id_tmp);
	END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

SELECT * FROM create_cart('2712dfe8-2711-4424-aaa1-d9893e27adc0', '694edfa0-d441-43be-a1c8-cecb6742b65c', 2);
SELECT * FROM create_cart('b66abae6-b65a-4f6f-ac0c-cf86af3176f9', '4b1c31ea-46c5-49fa-a324-22a4bfc4a0d4', 1);
SELECT * FROM cart_items;
SELECT * FROM carts;

-- Add elements to the cart:

DROP FUNCTION IF EXISTS cart_add(UUID, UUID, INTEGER) -- debugging purposes

CREATE OR REPLACE FUNCTION cart_add(
	IN cartid UUID, product UUID, "count" INTEGER
) RETURNS VOID
AS $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM cart_items WHERE product_id = $2) THEN
		EXECUTE 
			'INSERT INTO cart_items (cart_id, product_id, count)
				SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT product_id FROM cart_items WHERE cart_id = $1 AND product_id = $2);'
			USING cartid, product, "count";
	ELSE 
		RAISE EXCEPTION '% is already in the cart!', (SELECT title FROM products WHERE id = $2);
	END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;
SELECT * FROM carts;
SELECT * FROM cart_add('cd0a591d-3495-499b-b3e2-cdcfd689233e', 'd7efb68c-5228-4ec9-af29-10574ff80ade', 1);
SELECT * FROM cart_items ORDER BY cart_id;

-- Create order

DROP FUNCTION IF EXISTS create_order(UUID, UUID, JSON, JSON, VARCHAR, INTEGER) -- debugging purposes

CREATE OR REPLACE FUNCTION create_order(
	IN cartid UUID, userid UUID, pmt JSON, dlv JSON, cmt VARCHAR, total INTEGER
) RETURNS VOID
AS $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM orders WHERE cart_id = $1) THEN
		EXECUTE 
			'INSERT INTO orders (cart_id, user_id, payment, delivery, comments, total)
				SELECT $1, $2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT cart_id FROM orders WHERE cart_id = $1);' 
		USING cartid, userid, pmt, dlv, cmt, total;
	ELSE 
		RAISE EXCEPTION 'Orders in this cart are already closed, please contact support';
	END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

SELECT * FROM create_order('2b9979a5-00b6-45fe-8f84-ca9e87d2a2e0', 'b66abae6-b65a-4f6f-ac0c-cf86af3176f9', 
	'{"type": "online", "address": "10 Downing Street", "credit_card": "8888 8888 8888 8888"}',
	'{"type": "courier", "adress": "10 Downing Street"}', 'My favorite color is oh my god b#tch', 700);

SELECT * FROM orders;
UPDATE orders
SET status = 'ORDERED'
WHERE id = '95193172-fee3-436a-af53-c3766ea4b02c'

SELECT * FROM orders;
