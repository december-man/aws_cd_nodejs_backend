// Basic unit tests

import { handler } from "../source/lambda_handlers/importProductsFile";
import { APIGatewayProxyEvent } from "aws-lambda";

describe('ImportProductsFile', () => {

    it("should return 200 response with a signed url", async () => {
        const mockevent = {
            queryStringParameters: {
                name: "123.csv",
            },
        } as unknown as APIGatewayProxyEvent;

        const response = await handler(mockevent);
        expect(response.statusCode).toBe(200);
        // Check if the body is a signed url or not
        const body = JSON.parse(response.body);
    });


    it("should return 400 response if there is no query parameter 'name'", async () => {
        const mockevent2 = {
            queryStringParameters: {},
        } as unknown as APIGatewayProxyEvent;

        const response = await handler(mockevent2);
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toEqual({message: "Missing parameter 'name'"});
        });


    it("should return 400 if the file is not a .csv file", async () => {
        const mockevent3 = {
            queryStringParameters: {
            name : "123.jpg"
            },
        } as unknown as APIGatewayProxyEvent;

        const response = await handler(mockevent3);
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toEqual({message: "Please upload only csv files!"});
        });
});