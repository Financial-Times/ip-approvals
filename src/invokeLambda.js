require('dotenv').config()
const AWS = require('aws-sdk');

AWS.config.apiVersions = {
  lambda: '2015-03-31',
  // other service API versions
};

const lambda = new AWS.Lambda();

const params = {
  FunctionName: 'submit-approvals-response', /* required */
  // ClientContext: 'STRING_VALUE',
  // InvocationType: Event | RequestResponse | DryRun,
  // LogType: None | Tail,
  // Payload: Buffer.from('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
  // Qualifier: 'STRING_VALUE'
};

module.exports = {
  callLambda: async () => {
    lambda.invoke(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log('success!!');           // successful response
    });
  }
}