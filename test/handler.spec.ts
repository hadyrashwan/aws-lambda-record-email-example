import { handler } from '../src/handler'
import * as helpers from  '../src/helpers'
import { expect } from 'chai'
import * as sinon from 'sinon'
import 'mocha'
import moment from 'moment'
import { verify, verifyAndRestore } from 'sinon'

describe('handler', () => {
  const body = {
    "event-data": {
        "campaigns": {
            "L": []
        },
        "delivery-status": {
            "M": {
                "attempt-no": {
                    "N": "1"
                },
                "certificate-verified": {
                    "BOOL": true
                },
                "code": {
                    "N": "250"
                },
                "description": {
                    "S": ""
                },
                "message": {
                    "S": "OK"
                },
                "mx-host": {
                    "S": "smtp-in.example.com"
                },
                "session-seconds": {
                    "N": "0.4331989288330078"
                },
                "tls": {
                    "BOOL": true
                },
                "utf8": {
                    "BOOL": true
                }
            }
        },
        "envelope": {
            "M": {
                "sender": {
                    "S": "bob@mail.graphselfie.com"
                },
                "sending-ip": {
                    "S": "209.61.154.250"
                },
                "targets": {
                    "S": "alice@example.com"
                },
                "transport": {
                    "S": "smtp"
                }
            }
        },
        "event": {
            "S": "delivered"
        },
        "flags": {
            "M": {
                "is-authenticated": {
                    "BOOL": true
                },
                "is-routed": {
                    "BOOL": false
                },
                "is-system-test": {
                    "BOOL": false
                },
                "is-test-mode": {
                    "BOOL": false
                }
            }
        },
        "id": {
            "S": "CPgfbmQMTCKtHW6uIWtuVe"
        },
        "log-level": {
            "S": "info"
        },
        "message": {
            "M": {
                "attachments": {
                    "L": []
                },
                "headers": {
                    "M": {
                        "from": {
                            "S": "Bob <bob@mail.graphselfie.com>"
                        },
                        "message-id": {
                            "S": "20130503182626.18666.16540@mail.graphselfie.com"
                        },
                        "subject": {
                            "S": "Test delivered webhook"
                        },
                        "to": {
                            "S": "Alice <alice@example.com>"
                        }
                    }
                },
                "size": {
                    "N": "111"
                }
            }
        },
        "recipient": {
            "S": "alice@example.com"
        },
        "recipient-domain": {
            "S": "example.com"
        },
        "storage": {
            "M": {
                "key": {
                    "S": "message_key"
                },
                "url": {
                    "S": "https://se.api.mailgun.net/v3/domains/mail.graphselfie.com/messages/message_key"
                }
            }
        },
        "tags": {
            "L": [
                {
                    "S": "my_tag_1"
                },
                {
                    "S": "my_tag_2"
                }
            ]
        },
        "timestamp": {
            "N": "1521472262.908181"
        },
        "user-variables": {
            "M": {
                "my-var-2": {
                    "S": "awesome"
                },
                "my_var_1": {
                    "S": "Mailgun Variable #1"
                }
            }
        }
    },
    "signature": {
        "signature": {
            "S": "bed08444d3d6aa1961a12738c7a39f624de889dd639700e6972120947a6f95ac"
        },
        "timestamp": {
            "S": "1601891220"
        },
        "token": {
            "S": "9ce8bba0e03a00c96d617553ccf5fb5b1a4d362a0698b7a842"
        }
    }
}
  
  const dummyEvent = {
    headers: {},
    body:JSON.stringify(body),
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: 'xx',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '',
      apiId: '',
      connectedAt: 100,
      httpMethod: 'GET',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        sourceIp: '10.10.10.10',
        user: null,
        userAgent: null,
        userArn: null
      },
      path: 'xx',
      stage: 'test',
      requestId: 'id',
      requestTimeEpoch: 123,
      resourceId: 'a',
      resourcePath: 'xxx'
    },
    resource: ''
  }



  afterEach(function () {
    sinon.restore()
  })

  it('should return 401 for Mailgun corrupted signature ', async () => {
    
    const verify = sinon.stub(helpers,'verify').returns(false)
    const result = await handler(dummyEvent)
    expect(result).to.be.include({statusCode: 401})
  
  })
  
  
  
  it('should return 500 for Dynamodb failure!', async () => {
      
      const verify = sinon.stub(helpers,'verify').returns(true)
      
      const save = sinon.stub(helpers,'save').returns({$response:{data:JSON.stringify(body),error: {isError:true}}} as any)
      
      
      
      const result = await handler(dummyEvent)
      expect(result).to.include({statusCode: 500})
      
    })
    
    it('should return 500 for SNS failure!', async () => {
        
        const verify = sinon.stub(helpers,'verify').returns(true)
        const save = sinon.stub(helpers,'save').returns({$response:{data:JSON.stringify(body),error:false}} as any)
        
        const publish = sinon.stub(helpers, 'publish').returns({$response:{error: {isError:true}}} as any);
        
        
        
        const result = await handler(dummyEvent)
        expect(result).to.include({statusCode: 500})
        
    })
    
    it('should return 200 always!', async () => {
  
      const verify = sinon.stub(helpers,'verify').returns(true)
      const save = sinon.stub(helpers,'save').returns({$response:{data:JSON.stringify(body),error:false}} as any)
      const publish = sinon.stub(helpers, 'publish').returns({$response:{error:false}} as any);
  
  
  
      const result = await handler(dummyEvent)
      const resultBody = JSON.parse(JSON.parse(result.body))
      expect(result).to.include({statusCode: 200})
      expect(resultBody['event-data']).to.be.deep.equal(body['event-data'])
  
    })

  

})