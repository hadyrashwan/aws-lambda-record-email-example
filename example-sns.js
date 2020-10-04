console.log("Loading function");
var AWS = require("aws-sdk");

exports.handler = function (event, context) {
  var eventText = JSON.stringify(event, null, 2);
  console.log("Received event:", eventText);
  var sns = new AWS.SNS();
  var params = {
    Message: eventText,
    Subject: "Test SNS From Lambda",
    TopicArn: "arn:aws:sns:us-west-2:123456789012:test-topic1",
  };
  sns.publish(params, context.done);
};

// =============

// parameters 
let params = {
    Message: contentSMS,  // here your sms
    PhoneNumber: mobile,  // here the cellphone
  };
 
 
  const snsResult = await sns.publish(params, async (err, data) => {
     if (err) {
        console.log("ERROR", err.stack);
     }
     console.log('SNS ok: ' , JSON.stringify (data));
   });