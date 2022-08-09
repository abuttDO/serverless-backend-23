import { Field, InputType, registerEnumType } from "type-graphql";
import { IsEmail } from "class-validator";
import { UserRole } from "../utils";

registerEnumType( UserRole, { name: "UserRole"});

@InputType("CreateUserInput")
export class CreateUserInput {
	@Field()
	name: string;

	@Field()
	@IsEmail()
	email: string;

	@Field()
	password: string;
}

@InputType("LoginInput")
export class LoginInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	password: string;
}

@InputType("EditProfileInput")
export class EditProfileInput {
	@Field({ nullable: true })
	name?: string;

	@Field({ nullable: true })
	password?: string;

}

@InputType("RequestForgotPassInput")
export class RequestForgotPassInput {
	@Field()
	@IsEmail()
	email: string;
}

@InputType("ResetPasswordInput")
export class ResetPasswordInput {
	@Field()
	token: string;

	@Field()
	newPassword: string;
}

@InputType("GetUsersFilter")
export class GetUsersFilter {

	@Field(() => UserRole ,{ nullable: true })
	role: UserRole;

	@Field({ nullable: true })
	coord: string;
}

@InputType("ApplicationResultInput")
export class ApplicationResultInput {
	@Field()
	id: string;

	@Field()
	isSelected: boolean;

	@Field()
	coord: string;
}

@InputType("UpdateCoordAllocationInput")
export class EditCoordAllocationInput {
	@Field()
	id: string;

	@Field()
	coord: string;
}

@InputType("AllocatePointsInput")
export class AllocatePointsInput {
	@Field()
	id: string;

	@Field()
	points: number;
}