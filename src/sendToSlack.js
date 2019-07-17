const Slack = require('slack-node');

module.exports = {
	sendSlackMessage: function sendSlackMessage(content) {
		const webhookUri = 'https://hooks.slack.com/services/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'
		slack = new Slack();
		slack.setWebhook(webhookUri);
		slack.webhook({
			channel: "#junior-squad-2",
			username: "ip-approvals-test",
			icon_emoji: "https://cdn.glitch.com/899ccd26-b39f-4d00-a935-fd2940151804%2FIMG_6418.JPG?v=1563378319559",
			text: `${content.emailAddress} wants £${content.cost} for ${content.reason} :shocked-pikachu:`
		}, function (err, response) {
			console.log(response);
		});
	}
}