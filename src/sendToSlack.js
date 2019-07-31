const Slack = require('slack-node');

module.exports = {
    sendSlackMessage: (details) => {
        const { emailAddress, cost, reason } = details
        console.log(`${emailAddress} wants £${cost} for ${reason}`)

        const webhookUri = "https://hooks.slack.com/services/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";
        slack = new Slack();
        slack.setWebhook(webhookUri);
        
        slack.webhook({
        channel: "#junior-squad-2",
        username: "Approvals Bot",
        icon_emoji: "https://www.pngix.com/pngfile/big/0-7360_hand-holding-cash-money-hand-holding-money-png.png",
        text: `${emailAddress} wants £${cost} for ${reason}`
        }, function(err, response) {
            if(err) {
                console.log('An error has occured', err);
            } else  {
            console.log('message has been sent to Slack', response)
            }
        });

    }
}