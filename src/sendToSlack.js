const fetch = require('node-fetch');
const moment = require('moment');

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
        console.log('response number 2', response.statusText)
        return response.json();
      })
      .then(json => {
        console.log('approver slack id', json[0].slack.id)
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
        console.log('response', response.statusText)
        return response.json();
      })
      .then(json => {
        console.log('approver name, ', json[0].finance[0].name, ' requester id, ', json[0].slack.id)
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
        console.log(err)
        return reject(err)
      })
  })
}

module.exports = {
  sendSlackMessage: (details) => {
    console.log(details);
    const { emailAddress, cost, reason, url, calendarYear, travelCost, additionalInfo, uuid } = details

    console.log(`${emailAddress} wants £${cost} for ${reason}`)

    const person = emailAddress.split('@')[0]

    return new Promise((resolve, reject) => {
      console.log('trying to send');

      console.log('people api call')

      peopleApiCall(person)
        .then(result => {

          console.log(result)

          const messageForRequester = {
            "username": "Mopsa",
            "text": `:corn: Hi ${result.requesterName}, your approver is ${result.approverName} they have received your request`,
            "channel": `${result.requesterId}`,
            "icon_emoji": ":corn:",
            "attachments": [
              {
                "fallback": "Your request has been received",
                // "pretext": "New open task [Urgent]: <http://url_to_task|Test out Slack message attachments>",
                "color": "#D00000",
                // "fields": [
                //   {
                //     "title": "Notes",
                //     "value": "This is much easier than I thought it would be.",
                //     "short": false
                //   }
                // ]
              }
            ]
          }

          const messageForApprover = {
            "username": "Mopsa",
            "text": `:corn: Hi ${result.approverName}, you have a new TTC request ${uuid} from ${result.requesterName}`,
            // change back to result.approverId
            "channel": `${result.requesterId}`,
            "icon_emoji": ":corn:",
            "attachments": [
              {
                "fallback": "New open task [Urgent]: <http://url_to_task|Test out Slack message attachments>",
                // "pretext": "New open task [Urgent]: <http://url_to_task|Test out Slack message attachments>",
                "color": "#D00000",
                // "fields": [
                //   {
                //     "title": "Notes",
                //     "value": "This is much easier than I thought it would be.",
                //     "short": false
                //   }
                // ],
                "actions": [
                  {
                    "name": "approve",
                    "type": "button",
                    "text": "Approve :+1:",
                    "style": "primary",
                    "value": {answer: "approve", uuid: uuid},
                    "url": "https://lursqeu722.execute-api.eu-west-1.amazonaws.com/prod/"
                  },
                  {
                    "name": "deny",
                    "type": "button",
                    "text": "Deny :thumbsdown:",
                    "style": "danger",
                    "value": {answer: "deny", uuid: uuid},
                    "url": "https://lursqeu722.execute-api.eu-west-1.amazonaws.com/prod/"
                  
                  }
                ]
              }
            ]
          }

          const url = "https://hooks.slack.com/services/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"

          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageForApprover)
          })
            .then(response => {
              console.log('response', response.statusText)
              return resolve(response)
            })
            .catch(err => {
              console.log(err)
              return reject(err)
            })

          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageForRequester)
          })
            .then(response => {
              console.log('response', response.statusText)
              return resolve(response)
            })
            .catch(err => {
              console.log(err)
              return reject(err)
            })
        })
    })
  }
}