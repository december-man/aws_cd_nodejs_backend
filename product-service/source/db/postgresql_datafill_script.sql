-- Aliaksei's not-so-black market data filler

-- DDL part (creating tables in the postgresql database)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS products (
	id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
	title VARCHAR(500) NOT NULL UNIQUE,
	description VARCHAR(10000), 
	price INTEGER
);

CREATE TABLE IF NOT EXISTS stocks (
	product_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	"count" INTEGER NOT NULL,
	CONSTRAINT FK_stocks_products_id FOREIGN KEY (product_id) REFERENCES products (id)
);

-- DML part (inserting data)
-- Writing A function to add data based on the user input:

DROP FUNCTION IF EXISTS insert_data(TEXT,TEXT,INT); -- debugging

CREATE OR REPLACE FUNCTION insert_data(
IN 	product_title 			TEXT,
		description 			TEXT,
		price						INTEGER,
		"count"					INTEGER
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
$$ 	LANGUAGE plpgsql;


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


-- check yourself:
SELECT * FROM stocks;
SELECT * FROM products;


