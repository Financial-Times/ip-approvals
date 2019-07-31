const Slack = require('slack-node');

module.exports = {
    sendSlackMessage: (details) => {
        const { emailAddress, cost, reason, url, calendarYear, travelCost, additionalInfo } = details
        console.log(`${emailAddress} wants £${cost} for ${reason}`)

        const webhookUri = "https://hooks.slack.com/services/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";
        slack = new Slack();
        slack.setWebhook(webhookUri);
        
        slack.webhook({
        channel: "#junior-squad-2",
        username: "Approvals Bot",
        icon_emoji: "https://www.pngix.com/pngfile/big/0-7360_hand-holding-cash-money-hand-holding-money-png.png",
        attachments: [
            {
              "fallback": "Approve button",
              "actions": [
                {
                  "type": "button",
                  "text": "Approve",
                  "style": "primary",
                  "url": "https://flights.example.com/book/r123456"
                },
                {
                    "type": "button",
                    "text": "Deny",
                    "style": "danger",
                    "url": "https://flights.example.com/book/r123456"
                  }
              ]
            }
          ],
        text: `Hi! ${emailAddress} has sent through a new ${reason} request. 
        • URL: ${url}. 
        • Cost: £${cost}. 
        • Travel/accomodation cost: £${travelCost}. 
        • Calendar year: ${calendarYear}. 
        • Additional info: ${additionalInfo}.`
        }, function(err, response) {
            if(err) {
                console.log('An error has occured', err);
            } else  {
            console.log('message has been sent to Slack', response)
            }
        });

    }
}