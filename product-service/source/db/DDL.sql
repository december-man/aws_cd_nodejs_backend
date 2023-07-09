-- Aliaksei's not-so-black market data definer

-- DDL part (creating tables in the postgresql database)

-- Task 4

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
	
	
-- Task 8

CREATE TABLE IF NOT EXISTS users (
	id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	"name" VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL,
	"password" VARCHAR(100) NOT NULL,
	CONSTRAINT email_check CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

CREATE TABLE IF NOT EXISTS carts (
	id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
	user_id uuid NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	status VARCHAR(7) DEFAULT 'OPEN',
	CONSTRAINT open_or_closed CHECK (status IN ('OPEN', 'ORDERED')),
	CONSTRAINT FK_carts_users FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS cart_items (
	cart_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	product_id uuid,
	"count" INTEGER, 
	CONSTRAINT FK_cart_items_carts FOREIGN KEY (cart_id) REFERENCES carts (id),
	CONSTRAINT FK_cart_items_products FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS orders (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	cart_id uuid NOT NULL,
	payment JSON,
	delivery JSON,
	"comments" VARCHAR(1000),
	status VARCHAR(7) DEFAULT 'OPEN',
	total INTEGER,
	CONSTRAINT open_or_closed CHECK (status IN ('OPEN', 'ORDERED')),
	CONSTRAINT FK_orders_carts FOREIGN KEY (cart_id) REFERENCES carts (id)
);

-- Create trigger to set updated_at attribute on carts table update:

CREATE OR REPLACE FUNCTION last_updated() RETURNS TRIGGER
AS $update_trigger$
BEGIN
	NEW.updated_at = NOW(); -- NEW is a to-be-inserted row
	RETURN NEW; -- this function returns it updated with a new value for last_updated column.
END $update_trigger$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS last_updated ON carts; -- debugging/reusability
CREATE TRIGGER last_updated 
BEFORE UPDATE OR INSERT ON carts FOR EACH ROW EXECUTE PROCEDURE last_updated(); -- self-explanatory
