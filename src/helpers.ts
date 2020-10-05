import dynamodb from 'aws-sdk/clients/dynamodb'
import sns from 'aws-sdk/clients/sns'
import crypto from 'crypto'
import { IWebhook, ISignature } from './models'
import { TOPIC_SUBJECT, TOPIC_ARN, REGION, TABLE_NAME } from './environment'

export const publish = async (object: IWebhook) => {
  const topic = new sns()

  return await topic
    .publish({
      Message: JSON.stringify(object),
      Subject: TOPIC_SUBJECT,
      TopicArn: TOPIC_ARN
    })
    .promise()
}

export const verify = ({
  signingKey,
  timestamp,
  token,
  signature
}: ISignature) => {
  const encodedToken = crypto
    .createHmac('sha256', signingKey)
    .update(timestamp.concat(token))
    .digest('hex')

  return encodedToken === signature
}

export const save = async (object: IWebhook) => {
  const database = new dynamodb.DocumentClient({ region: REGION })

  return await database
    .put({
      TableName: TABLE_NAME,
      Item: { id: object['event-data'].id, ...object }
    })
    .promise()
}
