//const Slack = require('slack-node');
const fetch = require('node-fetch');
const moment = require('moment');

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

async function slackMessage(url, options) {
  const response = await fetch(url, options)

  const body = response.json()

  console.log(body)

  return body
}

module.exports = {
  sendSlackMessage: () => {
    // console.log(details);
    // const { emailAddress, cost, reason, url, calendarYear, travelCost, additionalInfo } = details

    // console.log(`${emailAddress} wants £${cost} for ${reason}`)

    // const person = emailAddress.split('@')[0]

    // console.log('Calling People API')
    // const response = await peopleApiCall(person)

    // console.log("approver", response[0].finance[0].name, "slack id", response[0].slack.id)

    // const secondResponse = await peopleApiCall(response[0].finance[0].name)

    // console.log("approver's slack id", secondResponse[0].slack.id)

    // // hard-coded to Kate's Slack id but will use info above
    // const approver = response[0].slack.id

    // // also hard-coded to Kate's id
    // const requester = response[0].slack.id
    // // const requester = emailAddress;

    // const message = {
    //   "username": "Approvals Bot",
    //   "icon_emoji": "https://www.pngix.com/pngfile/big/0-7360_hand-holding-cash-money-hand-holding-money-png.png",
    //   "attachments": [
    //     {
    //       "fallback": "Approve button",
    //       "attachment_type": "default",
    //       "attachments": [{
    //         "text": "Approve"
    //       }],
    //       "callback_id": "123",
    //       "actions": [
    //         {
    //           "name": "approve",
    //           "type": "button",
    //           "text": "Approve",
    //           "style": "primary",
    //           "value": "yeeeee"
    //         },
    //         {
    //           "name": "deny",
    //           "type": "button",
    //           "text": "Deny",
    //           "style": "danger",
    //           "value": "hawwwwwwww"
    //         }
    //       ]
    //     }
    //   ],
    //   "text": "boooooo",
		// "channel": "U03E98JJN"
    // }

    return new Promise((resolve, reject) => {
      console.log('trying to send');

      const message = {
        "username":"Mopsa", 
        "text":":corn: Hi Jill",
        "channel":"U03E98JJN",
        "icon_emoji": ":corn:"
    }
      const recipient = 'U03E98JJN'
      const url = 'https://hooks.slack.com/services/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'
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      }

      fetch(url, options)
      .then(response => {
        console.log('response', response.statusText)
        return resolve(response)
      })
      .catch(err => {
        console.log(err)
        return reject(err)
      })
    })
  }
}