const functions = require('firebase-functions');
const cors = require('cors')({ origin: true});
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatbot-serviciosacademic-jsmi-default-rtdb.firebaseio.com"
});

const { SessionsClient } = require('dialogflow');
//const dialogflow = require('@google-cloud/dialogflow');
//const uuid = require('uuid');


exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionId } = request.body;
    const projectId = "chatbot-serviciosacademic-jsmi";


    const sessionClient = new SessionsClient({ credentials: serviceAccount });
    //const session = sessionClient.sessionPath('fireship-lessons', sessionId);
    const session = sessionClient.sessionPath(projectId, sessionId);

    const responses = await sessionClient.detectIntent({ session, queryInput});

    const result = responses[0].queryResult;

    response.send(result);
  });
});


const { WebhookClient } = require('dialogflow-fulfillment');

exports.dialogflowWebhook = functions.https.onRequest(async (request, response) => {
  const agent = new WebhookClient({request, response});
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function activacionDeCuenta(agent) {
    agent.add(`Estoy enviando esta respuesta!`);
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('activacionDeCuenta', activacionDeCuenta);
  agent.handleRequest(intentMap);
});