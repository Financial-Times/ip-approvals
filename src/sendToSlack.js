const fetch = require('node-fetch');
//const moment = require('moment');

require('dotenv').config()

const secondPeopleAPIcall = (approver) => {

  approver = approver.replace(' ', '.')

  const peopleAPIurl = `https://ip-people.herokuapp.com/api/people/${approver}`

  const options = {
    method: 'GET',
    headers: {
      'apikey': process.env.PEOPLE_API_KEY
    }
  };

  return new Promise((resolve, reject) => {
    fetch(peopleAPIurl, options)
      .then(response => {
        return response.json();
      })
      .then(json => {
        resolve({
          approverId: json[0].slack.id,
        })
      })
  })
}

const peopleApiCall = (person) => {
  const peopleAPIurl = `https://ip-people.herokuapp.com/api/people/${person}`

  const options = {
    method: 'GET',
    headers: {
      'apikey': process.env.PEOPLE_API_KEY
    }
  };

  return new Promise((resolve, reject) => {
    fetch(peopleAPIurl, options)
      .then(response => {
        return response.json();
      })
      .then(json => {
        secondPeopleAPIcall(json[0].finance[0].name)
          .then(result => {
            resolve({
              approverId: result.approverId,
              approverName: json[0].finance[0].name,
              requesterId: json[0].slack.id,
              requesterName: json[0].name
            })
          })
      })
      .catch(err => {
        return reject(err)
      })
  })
}

module.exports = {
  sendSlackMessage: (details) => {
    const { emailAddress, cost, reason, url, calendarYear, travelCost, additionalInfo, uuid } = details

    const person = emailAddress.split('@')[0]

    return new Promise((resolve, reject) => {
      peopleApiCall(person)
        .then(result => {
          const messageForRequester = {
            // text that appears in Slack notification
            text: `Hi ${result.requesterName}, your approver ${result.approverName} has received your new ${reason} request.\n• Cost: £${cost}\n• Travel/accomodation cost: £${travelCost}\n• Calendar year: ${calendarYear}\n• Booking url: ${url}\n• Additional info: ${additionalInfo}\n• Request id: ${uuid}`,
            channel: `${result.requesterId}`,
            // text that appears in Slack message
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `Hi ${result.requesterName}, your approver ${result.approverName} has received your new ${reason} request.\n• Cost: £${cost}\n• Travel/accomodation cost: £${travelCost}\n• Calendar year: ${calendarYear}\n• Url: ${url}\n• Additional info: ${additionalInfo}\n• Request id: ${uuid}`,
                },
              }
            ]
          }

          const messageForApprover = {
            // if testing locally, change channel to a user's Slack id else result.approverId to send to real budget approver.
            channel: `${result.approverId}`,
            // text that appears in the Slack notification
            text: `Hi ${result.approverName}, you have a new ${reason} request from ${result.requesterName}\n• Cost: £${cost}\n• Cost: £${cost}\n• Travel/accomodation cost: £${travelCost}\n• Calendar year: ${calendarYear}\n\n• Url: ${url}• Additional info: ${additionalInfo}\n• Request id: ${uuid}`,
            // text that appears in the Slack id
            blocks: [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `Hi ${result.approverName}, you have a new ${reason} request from ${result.requesterName}.\n• Cost: £${cost}\n• Travel/accomodation cost: £${travelCost}\n• Calendar year: ${calendarYear}\n• Url: ${url}\n• Additional info: ${additionalInfo}\n• Request id: ${uuid}`
                }
              },
              {
                "type": "actions",
                "block_id": "approvalblock",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Approve"
                    },
                    "style": "primary",
                    "value": "approve"
                  },
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Deny"
                    },
                    "style": "danger",
                    "value": "deny"
                  }
                ]
              }
            ]
          }

          const slackUrl = "https://slack.com/api/chat.postMessage"

          fetch(slackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`
            },
            body: JSON.stringify(messageForApprover)
          })
            .then(response => response.json())
            .then(data => {
              return resolve(data)
            })
            .catch(err => {
              return reject(err)
            })

          fetch(slackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`
            },
            body: JSON.stringify(messageForRequester)
          })
            .then(response => response.json())
            .then(data => {
              return resolve(data)
            })
            .catch(err => {
              return reject(err)
            })
        })
    })
  }
}