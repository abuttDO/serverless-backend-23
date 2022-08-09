import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType("SendSupportMailInput")
export class SendSupportMailInput {
	@Field()
	name: string;

	@Field()
	@IsEmail()
	email: string;

	@Field()
	content: string;
}