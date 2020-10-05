import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { MAILGUN_WEBHOOK_KEY } from './environment'
import { save, publish, verify as verifySignature } from './helpers'
import { IWebhook } from './models'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const object = JSON.parse(event.body as string) as IWebhook

  const dynamodbResponse = await save(object)

  if (!verifySignature(object.signature,MAILGUN_WEBHOOK_KEY)) {
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
