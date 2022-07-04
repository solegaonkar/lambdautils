const jwt = require("jsonwebtoken");
const lambdautils = {};
let requestId = "";

const verifyToken = async (event) => {
  requestId = event?.requestContext?.requestId;
  return new Promise((resolve, reject) => {
    let auth = event?.headers?.Authorization;
    if (auth && auth.startsWith("Bearer ")) {
      auth = auth.substring("Bearer ".length);
      jwt.verify(auth, process.env.SECRET, (err, decoded) => {
        if (!err) {
          return resolve(decoded);
        }
      });
    }
    resolve(null);
  });
};

lambdautils.error = (error) => {
  console.log(
    `${moment().format("yyyy/MM/DD HH:mm:ss")} - ${requestId} - ${error}`
  );
};

lambdautils.warn = (warn) => {
  console.log(
    `${moment().format("yyyy/MM/DD HH:mm:ss")} - ${requestId} - ${warn}`
  );
};

lambdautils.info = (info) => {
  console.log(
    `${moment().format("yyyy/MM/DD HH:mm:ss")} - ${requestId} - ${info}`
  );
};

lambdautils.debug = (debug) => {
  console.log(
    `${moment().format("yyyy/MM/DD HH:mm:ss")} - ${requestId} - ${debug}`
  );
};

lambdautils.signToken = async (data, lifeSeconds) =>
  jwt.sign(
    {
      exp: lifeSeconds ? Math.floor(Date.now() / 1000) + lifeSeconds : null,
      data: data,
    },
    process.env.SECRET
  );

lambdautils.parseProxyEvent = async ({ event }) =>
  await verifyToken(event).then((auth) => ({
    body: JSON.parse(event.body),
    accountId: event?.requestContext?.accountId,
    requestTime: event?.requestContext?.requestTimeEpoch,
    sourceIp: event?.requestContext?.identity?.sourceIp,
    userAgent: event?.requestContext?.identity?.userAgent,
    authorization: auth,
    apiKey: event?.headers["x-api-key"],
  }));

lambdautils.respond = async (response) => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
  },
  body: JSON.stringify(await response),
});
export default lambdautils;
