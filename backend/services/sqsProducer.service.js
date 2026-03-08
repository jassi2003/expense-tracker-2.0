import { sqsClient } from "../config/sqsClient.js";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

export const sendReportJob = async (data) => {

  const command = new SendMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    MessageBody: JSON.stringify(data)
  });

  const response = await sqsClient.send(command);
  console.log("producer response",response)

  return response.MessageId;
};