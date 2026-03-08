import dotenv from "dotenv";
dotenv.config();
import connectDb from "../config/mongoDb.js"
await connectDb();


import {
  ReceiveMessageCommand,
  DeleteMessageCommand
} from "@aws-sdk/client-sqs";

const { sqsClient } = await import("../config/sqsClient.js");
import { generateAndSendReport } from "../services/analyticsReport.service.js";


const QUEUE_URL = process.env.SQS_QUEUE_URL;

async function pollQueue() {

  const command = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 10
  });

  const response = await sqsClient.send(command);

  if (!response.Messages) return;

  for (const message of response.Messages) {

    const data = JSON.parse(message.Body);

    console.log("Processing report job:", data);

    await generateAndSendReport(data);

    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle
      })
    );

    console.log("Job finished");
  }
}

while (true) {
  await pollQueue();
}