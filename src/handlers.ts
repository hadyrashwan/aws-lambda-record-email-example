import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import moment from 'moment'
import { save, publish, verify as verifySignature } from './helpers'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const object: any = {
    id: moment.utc().toISOString(),
  }

  const dynamodbResponse = await save(object)

  if (!verifySignature(object.signature)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ msg: 'access denied, bad signature' })
    }
  }

  if (dynamodbResponse.$response.error) {
    return {
      statusCode: 500,
      body: JSON.stringify(dynamodbResponse.$response.error)
    }
  }

  const snsResponse = await publish(object)

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
