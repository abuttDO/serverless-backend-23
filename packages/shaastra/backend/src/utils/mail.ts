import Mailjet from 'node-mailjet'

export const mail = async ({
  email,
  sub,
  body,
}: {
  email: string;
  sub: string;
  body: string;
}) => {
  const mailjet = Mailjet.apiConnect(process.env.MAILJET_PUBLIC_KEY!, process.env.MAILJET_PRIVATE_KEY!);
  const request = mailjet
	.post("send", {'version': 'v3.1'})
	.request({
		"Messages":[
				{
						"From": {
								"Email": "ca@shaastra.org",
								"Name": "Campus Ambassador"
						},
						"To": [
								{
										"Email": email,
										"Name": name
								}
						],
						"Subject": sub,
						"HTMLPart": body
				}
		]
	})
request
	.then((result: any) => {
		console.log(result.body)
	})
	.catch((err: any) => {
		console.log(err.statusCode)
	})
};
