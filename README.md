## AWS Cloud Developer Rsschool product service backend (Aliaksei's 'Not so Black' Market)

#### Task 3.1

  1. ~~Create a lambda function called getProductsList under the same AWS CDK Stack file of Product Service which will be triggered by the HTTP GET method.~~
  2. ~~The requested URL should be /products.~~
  3. ~~The response from the lambda should be a full array of products (mock data should be used - this mock data should be stored in Product Service).~~
  4. ~~This endpoint should be integrated with Frontend app for PLP (Product List Page) representation.~~

#### Task 3.2

  1. ~~Create a lambda function called getProductsById under the same AWS CDK Stack file of Product Service which will be triggered by the HTTP GET method.~~
  2. ~~The requested URL should be /products/{productId} (what productId is in your application is up to you - productName, UUID, etc.).~~
  3. ~~The response from the lambda should be 1 searched product from an array of products (mock data should be used - this mock data should be stored in Product Service).~~
  4. ~~This endpoint is not needed to be integrated with Frontend right now.~~

#### Task 3.3
  
  1. ~~Commit all your work to separate branch (e.g. task-3 from the latest master) in your own repository.~~
  2. ~~Create a pull request to the master branch.~~
  3. ~~Submit link to the pull request to Crosscheck page in RS App.~~

#### Additional Tasks

  1. SWAGGER documentation is created for Product Service
  2. Lambda handlers are covered by basic UNIT tests (NO infrastructure logic is needed to be covered)
  3. ~~Lambda handlers (getProductsList, getProductsById) code is written not in 1 single module (file) and separated in codebase.~~
  4. ~~Main error scenarios are handled by API ("Product not found" error).~~

## Links and commentary:

#### Product Service API: https://x43rdjvcy0.execute-api.eu-central-1.amazonaws.com

 /products: https://x43rdjvcy0.execute-api.eu-central-1.amazonaws.com/products
 /products/{productId}: https://x43rdjvcy0.execute-api.eu-central-1.amazonaws.com/products/6 
 (Id is a counter from 1 to 7)

#### Link to FE PR: https://github.com/december-man/nodejs-aws-shop-react/pull/2

(Shortcut: https://d172ijz47ga3e3.cloudfront.net/)

#### SWAGGER: TO DO



