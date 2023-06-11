-- Aliaksei's not-so-black market data definer

-- DDL part (creating tables in the postgresql database)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS products (
	id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
	title VARCHAR(500) NOT NULL UNIQUE,
	description VARCHAR(10000) NOT NULL, 
	price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS stocks (
	product_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	"count" INTEGER NOT NULL,
	CONSTRAINT FK_stocks_products_id FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Creating a VIEW of products & stocks jointable

CREATE OR REPLACE VIEW items AS
	SELECT 	products.id,
				stocks."count",
				products.price,
				products.title,
				products.description
	FROM products 
	INNER JOIN stocks ON products.id = stocks.product_id




