// Basic unit tests

import { handler } from "../source/lambda_handlers/catalogBatchProcess";

describe('catalogBatchProcess', () => {

    it("should do smthn", async () => {
        const response = await handler(somemockevent);
        expect(response.body!).toBe('free');
    });
});
