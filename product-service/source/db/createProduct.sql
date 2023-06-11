-- Create Product Function

DROP FUNCTION IF EXISTS createProduct(TEXT, TEXT, INT, INT); -- debugging

CREATE OR REPLACE FUNCTION createProduct(
IN 	product_title 			TEXT,
		description 			TEXT,
		price						INTEGER,
		"count"					INTEGER
) RETURNS VOID
AS $$
DECLARE
id_tmp uuid;
BEGIN
	IF NOT EXISTS (SELECT 1 FROM products WHERE UPPER(TRIM(product_title)) = UPPER(title)) THEN
		EXECUTE 
			'INSERT INTO products (title, description, price)
				SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT * FROM products WHERE UPPER(title) = UPPER($1))
			 RETURNING id;' INTO id_tmp USING product_title, description, price;
		EXECUTE
			'INSERT INTO stocks (product_id, count)
				SELECT $1, $2 WHERE NOT EXISTS (SELECT product_id FROM stocks WHERE product_id = $1);' USING id_tmp, "count";
	ELSE 
		RAISE EXCEPTION '% is already in the products table!', product_title;
	END IF;
END; 
$$ 	LANGUAGE plpgsql VOLATILE;



