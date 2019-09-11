const { sendSlackMessage } = require('./sendToSlack');
exports.handler = async (event) => {
	const eventBody = JSON.parse(event.Records[0].body);
    const content = JSON.parse(eventBody.Message).content;
    const objectString = content.match(/\{([\s\S]*?)\}/g);
    const finalObject = JSON.parse(objectString[0].replace(/(\r\n|\n|\r)/gm, ""));
    sendSlackMessage(finalObject);
};