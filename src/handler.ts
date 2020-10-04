import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import moment from 'moment'
import dynamodb from 'aws-sdk/clients/dynamodb'
import sns from 'aws-sdk/clients/sns'

const database = new dynamodb.DocumentClient({ region: 'us-east-1' })
const topic = new sns()

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const object = {
    id: moment.utc().toISOString()
  }

  const dynamodbResponse = await database
    .put({
      TableName: 'mailgun_events',
      Item: object
    })
    .promise()

  if (dynamodbResponse.$response.error) {
    return {
      statusCode: 500,
      body: JSON.stringify(dynamodbResponse.$response.error)
    }
  }

  const snsResponse = await topic.publish({
    Message: JSON.stringify(object),
    Subject: 'Test SNS From Lambda',
    TopicArn: 'arn:aws:sns:us-east-1:456389668492:email_events'
  }).promise()

  if (snsResponse.$response.error) {

    return {
      statusCode: 500,
      body: JSON.stringify(snsResponse.$response.error)
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(dynamodbResponse.$response.data)
  }
}
