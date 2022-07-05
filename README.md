# lambdautils
Handy utility functions for a Lambda Function

AWS Lambda functions invoked from API Gateway Proxy Integration require some common functionality. That is encapsulated in this module.

## parseProxyEvent(event)
This method extracts useful details from the event object:
```
{
    body: JSON.parse(event.body),
    accountId: event?.requestContext?.accountId,
    requestTime: event?.requestContext?.requestTimeEpoch,
    sourceIp: event?.requestContext?.identity?.sourceIp,
    userAgent: event?.requestContext?.identity?.userAgent,
    authorization: auth,
    apiKey: event?.headers["x-api-key"],
}
```
This also validates any authentication in the Authorization header. If it is a Bearer JWT token, it is verified with the SECRET environment variable. If it is valid, the data of the token is available in the `authorization: auth`. Else it is ignored.

## respond(response)
This takes care of adding the CORS headers to the response, along with stringifying the JSON.

## Logging
To enable tracing and logging, we have utility functions error(), warn(), info() and debug(). They will log along with a log type and request id. 
setLogLevel() can be used to set the level 0-debug 1-info 2-warn 3-error

## signToken(data, lifeInSeconds)
This signs a new JWT using the process.env.SECRET

