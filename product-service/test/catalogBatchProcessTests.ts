import { SQSEvent } from "aws-lambda";
import { handler } from "../source/lambda_handlers/catalogBatchProcess";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";

// SNS mock
const SNSMock = mockClient(SNSClient as any);
SNSMock.onAnyCommand().resolves({});

// Item mock
const ItemMock = {
    id: 'e3fe69a4-d9a7-4a59-b136-f5d5d4277e52',
    title: 'Biohacking Accesories for Trans-Humanists',
    description: 'Why wear wristwatch? Implant NFC chip right in your arm!',
    price: '400',
    count: '3',
};

// event mock
const EventMock = {
    Records: [
        {
            body: JSON.stringify(ItemMock),
        },
    ],
};
  
describe('catalogBatchProcess handler', () => {
    it('should log the following message on successful addition of a new item', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {}) as any;
        await handler(EventMock as SQSEvent);
        expect(spy).toHaveBeenCalledWith(`echo catalogBatchProcess: ${JSON.stringify(ItemMock)}`);
        spy.mockRestore();
    });
    
    it('should send an email via SNS', async () => {
        await handler(EventMock as SQSEvent);
        expect(SNSMock).toHaveReceivedCommand(PublishCommand as any);
    });
});
