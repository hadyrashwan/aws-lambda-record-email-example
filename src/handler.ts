import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import moment from 'moment'
import dynamodb from 'aws-sdk/clients/dynamodb'

const dd = new dynamodb.DocumentClient({ region: 'us-east-1' })

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: 'mailgun_events',
    Item: {
      id: moment.utc().toISOString()
    }
  }

  const result = await dd.put(params).promise()

  if (result.$response.error) {
    return {
      statusCode: 500,
      body: JSON.stringify(result.$response.error)
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.$response.data)
  }
}
