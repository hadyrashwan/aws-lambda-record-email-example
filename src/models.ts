export interface IWebhook {
  signature: ISignature
  'event-data': IEventData
}

export interface ISignature {
  signingKey: string
  timestamp: string
  token: string
  signature: string
}

interface IEventData {
  id: string
  event: string
  timestamp: string
}
