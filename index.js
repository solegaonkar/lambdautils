const jwt = require("jsonwebtoken");
const lambdautils = {};
let requestId = "";
let loglevel = 0;

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

lambdautils.setLogLevel = (level) => {
  loglevel = level;
};

lambdautils.error = (error) => {
  console.log(
    `${moment().format("yyyy/MM/DD HH:mm:ss")} - ${requestId} - E - ${error}`
  );
};

lambdautils.warn = (warn) => {
  if (loglevel < 3)
    console.log(
      `${moment().format("yyyy/MM/DD HH:mm:ss")} - ${requestId} - W - ${warn}`
    );
};

lambdautils.info = (info) => {
  if (loglevel < 2)
    console.log(
      `${moment().format("yyyy/MM/DD HH:mm:ss")} - ${requestId} - I - ${info}`
    );
};

lambdautils.debug = (debug) => {
  if (loglevel === 0)
    console.log(
      `${moment().format("yyyy/MM/DD HH:mm:ss")} - ${requestId} - D - ${debug}`
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
    requestId: event?.requestContext?.requestId,
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
module.exports = lambdautils;
