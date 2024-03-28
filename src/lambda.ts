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
	let { body } = event;
	if (typeof body === 'string') {
		body = JSON.parse(body);
	}

	let parsedBody;
	try {
		parsedBody = analyticsEventSchema.parse(body);
	} catch (e) {
		console.log(e);

		return {
			statusCode: 400,
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ error: e, body }, null, 2),
		};
	}

	try {
		const response = await sendToStitch(parsedBody);

		if (!response.ok) {
			console.error(response.statusText);
			return {
				statusCode: response.status,
				headers: { 'content-type': 'application/json' },
				body: 'Failed to send to stitch, check the logs for more information.',
			};
		}

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
