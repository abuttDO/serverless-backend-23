import { mail } from "../utils/mail";
import { Arg, Mutation, Resolver } from "type-graphql";
import { SendSupportMailInput } from "../inputs/Mail";

@Resolver()
export class MailResolver {
  @Mutation(() => Boolean)
  async sendSupportMail(
    @Arg("data") { name, email, content }: SendSupportMailInput
  ) {
    const body = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  
      <head>
        <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width">
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <title></title>
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" type="text/css">
        <!--<![endif]-->
      </head>
  
      <body style="font-family: 'Poppins'">
          <h3>Name : ${name}</h3>
          <h3>Email : ${email}</h3>
          <h3>Message : ${content}</h3>
      </body>
  
      </html>`;
    await mail({ email: "ca@shaastra.org", sub: "Query | CA program", body });
    return true;
  }
}
