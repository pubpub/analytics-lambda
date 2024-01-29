import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { eventSchema } from 'utils/api/schemas/analytics';

// AWS Lambda Function Urls are reusing types from APIGateway
// but many fields are not used or filled with default values
// see: https://docs.aws.amazon.com/lambda/latest/dg/urls-invocation.html
// It would be nice to have types with only the used fields and add them to:
// https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/aws-lambda
type LambdaFunctionUrlEvent = APIGatewayProxyEventV2;
type LambdaFunctionUrlResult = APIGatewayProxyResultV2;

// Note: think of enhancing logging with structure (JSON) and metrics
// - @atombrenner/log-json: https://github.com/atombrenner/npm-log-json
// - pino: https://github.com/pinojs/pino
// - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html
// - @aws-lambda-powertools/metrics: https://docs.powertools.aws.dev/lambda/typescript/latest/core/metrics/#getting-started

const sendToStitch = async (payload: any) => {
	if (!process.env.STITCH_WEBHOOK_URL) {
		throw new Error('Missing STITCH_WEBHOOK_URL');
	}

	const response = await fetch(process.env.STITCH_WEBHOOK_URL, {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: {
			'Content-Type': 'application/json',
		},
	});

	return response;
};

export async function handler(
	event: LambdaFunctionUrlEvent,
	context: Context,
): Promise<LambdaFunctionUrlResult> {
	console.log(context.functionName);
	console.log(`${event.requestContext.http.method} ${event.rawPath}`);

	try {
		eventSchema.parse(event);
	} catch (e) {
		console.log(e);

		return {
			statusCode: 400,
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(e, null, 2),
		};
	}

	try {
		await sendToStitch(event.body);

		return {
			statusCode: 204,
			headers: { 'content-type': 'application/json' },
		};
	} catch (e) {
		console.log(e);
		return {
			statusCode: 500,
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(e, null, 2),
		};
	}
}
