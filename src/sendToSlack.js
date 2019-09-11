const Slack = require('slack-node');
const fetch = require('node-fetch');
require('dotenv').config()

async function peopleApiCall(person) {
  const peopleAPIurl = `https://ip-people.herokuapp.com/api/people/${person}`

  const response = await fetch(peopleAPIurl, {
    method: 'GET',
    headers: {
      'apikey': process.env.PEOPLE_API_KEY
    }
  });

  return response.json()
}

module.exports = {
  sendSlackMessage: async (details) => {

    const { emailAddress, cost, reason, url, calendarYear, travelCost, additionalInfo } = details

    console.log(`${emailAddress} wants £${cost} for ${reason}`)

    const person = emailAddress.split('@')[0]

    console.log('Calling People API')
    const response = await peopleApiCall(person)

    console.log("approver", response[0].finance[0].name, "slack id", response[0].slack.id)

    const secondResponse = await peopleApiCall(response[0].finance[0].name)

    console.log("approver's slack id", secondResponse[0].slack.id)

    // hard-coded to Kate's Slack id but will use info above
    const approver = response[0].slack.id

    // also hard-coded to Kate's id
    const requester = response[0].slack.id
    // const requester = emailAddress;

    slack = new Slack();

    slack.setWebhook("https://hooks.slack.com/services/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");

    console.log('connected to slack webhook')
    const approvedValue = {
      "user": emailAddress,
      "status": "Approve",
      "cost": cost,
      "reason": reason,
      "url": url,
      "calendarYear": calendarYear,
      "travelCost": travelCost,
      "additionalInfo": additionalInfo
    }

    const deniedValue = {
      "user": emailAddress,
      "status": "Deny",
      "cost": cost,
      "reason": reason,
      "url": url,
      "calendarYear": calendarYear,
      "travelCost": travelCost,
      "additionalInfo": additionalInfo
    }

    slack.webhook({
      username: "Approvals Bot",
      icon_emoji: "https://www.pngix.com/pngfile/big/0-7360_hand-holding-cash-money-hand-holding-money-png.png",
      attachments: [
        {
          "fallback": "Approve button",
          "attachment_type": "default",
          "attachments": [{
            "text": "Approve"
          }],
          "callback_id": "123",
          "actions": [
            {
              "name": "approve",
              "type": "button",
              "text": "Approve",
              "style": "primary",
              "value": JSON.stringify(approvedValue)
            },
            {
              "name": "deny",
              "type": "button",
              "text": "Deny",
              "style": "danger",
              "value": JSON.stringify(deniedValue)
            }
          ]
        }
      ],
      text: `Hi! <@${requester}> has sent through a new ${reason} request. 
        • URL: ${url}. 
        • Cost: £${cost}. 
        • Travel/accomodation cost: £${travelCost}. 
        • Calendar year: ${calendarYear}. 
        • Additional info: ${additionalInfo}.`
    }, function (err, response) {
      if (err) {
        console.log('An error has occured', err);
      } else {
        console.log('message has been sent to Slack', response.status)
      }
    })
  }
}

/* to do :

- selectn for fields
- fix url fields so they don't render weirdly
- if no addtional info, then don't put 'undefined'

*/