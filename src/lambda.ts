import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { analyticsEventSchema } from 'utils/api/schemas/analytics';

type LambdaFunctionUrlEvent = APIGatewayProxyEventV2;
type LambdaFunctionUrlResult = APIGatewayProxyResultV2;

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
	// console.log(`${event.requestContext.http.method} ${event.rawPath}`);

	try {
		analyticsEventSchema.parse(event);
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
