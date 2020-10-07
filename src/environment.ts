export const REGION = process.env.REGION || 'us-east-1'
export const TABLE_NAME = process.env.TABLE_NAME || 'mailgun_events'
export const TOPIC_ARN = process.env.TOPIC_ARN ||'arn:aws:sns:us-east-1:456389668492:email_events'
export const TOPIC_SUBJECT = process.env.TOPIC_SUBJECT ||'Test SNS From Lambda'
export const MAILGUN_WEBHOOK_KEY = process.env.MAILGUN_WEBHOOK_KEY ||'key-xx'
