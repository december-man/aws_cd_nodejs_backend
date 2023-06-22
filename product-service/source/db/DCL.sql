-- DCL part of product-service-db scripts

-- Dropping all public privileges
REVOKE CONNECT ON DATABASE postgres FROM PUBLIC;
REVOKE TEMP ON DATABASE postgres FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
SELECT * FROM information_schema.table_privileges WHERE grantee = 'PUBLIC' AND table_schema = 'public'; -- check

-- Creating group role creator with read-only access and createProd execution privileges:
CREATE ROLE creator WITH NOLOGIN NOBYPASSRLS;
GRANT USAGE ON SCHEMA public TO creator;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO creator;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO creator;

CREATE ROLE your_role LOGIN PASSWORD 'XXXXXXXXXXXXX' INHERIT; -- create your own user role
GRANT creator TO your_role; 
GRANT CONNECT ON DATABASE postgres TO your_role;


