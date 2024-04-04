import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { analyticsEventSchema } from 'utils/api/schemas/analytics';
import { getCountryForTimezone } from 'countries-and-timezones';

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
	if (event.rawPath === '/health') {
		return {
			statusCode: 200,
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ message: 'ok' }, null, 2),
		};
	}

	let { body } = event;

	console.log(event);
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
		const { timezone } = parsedBody;

		const { name: country = null, id = null } = getCountryForTimezone(timezone) || {};
		const response = await sendToStitch({ country, countryCode: id, ...parsedBody });

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
