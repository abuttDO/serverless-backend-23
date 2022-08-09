import { User } from "../entities/user";
import { ApplicationResultInput, CreateUserInput, EditProfileInput, GetUsersFilter, LoginInput, RequestForgotPassInput, ResetPasswordInput, EditCoordAllocationInput, AllocatePointsInput } from "../inputs/user";
import { Arg, Authorized, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MyContext } from "../utils/context";
import { ADMINMAILLIST, UserRole } from "../utils";
import cuid from "cuid";
import { Like } from "typeorm";
import { TaskReview } from "../entities/Taskreview";
import { Questionnaire } from "../entities/Questionnaire";
import { parse } from "json2csv";

@ObjectType("GetUsersOutput")
class GetUsersOutput {
    @Field(() => [User])
    users: User[];

    @Field(() => Number)
    count: Number;
}

@Resolver(User)
export class UserResolver {

    @Mutation(() => Boolean)
    async createUser(@Arg("data") data: CreateUserInput) {
        const user = await User.create({ ...data }).save();

        const { name, email, id, verficationToken: verifyToken } = user;
        await User.sendVerificationMail({ name, email, id, verifyToken });

        if (ADMINMAILLIST.includes(email)) {
            const { affected } = await User.update(user?.id, { role: UserRole.ADMIN })
            return affected === 1;
        }

        return true;
    }

    @Mutation(() => Boolean)
    async verifyUser(@Arg("token") token: string) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
        const user = await User.findOneOrFail({ where: { id: decoded.id } });

        if (user.isVerified === true) return true;

        if (user.verficationToken === decoded.verifyToken) {
            const { affected } = await User.update(user.id, { isVerified: true });
            if (affected === 1) {
                await User.sendConfirmationMail({ name: user.name, email: user.email });
                return true;
            }
        }
        return false;
    }

    @Mutation(() => Boolean)
    async resendVerificationMail(@Arg("data") { email }: RequestForgotPassInput) {
        const user = await User.findOneOrFail({ where: { email } });
        const { name, id, verficationToken: verifyToken, isVerified } = user;

        if (isVerified) throw new Error("Email has been verified before");

        await User.sendVerificationMail({ name, email, id, verifyToken });

        return true;
    }

    @Mutation(() => User, { nullable: true })
    async login(@Arg("data") { email, password }: LoginInput, @Ctx() { res }: MyContext) {
        const user = await User.findOneOrFail({ where: { email } });
        if (!user) throw new Error("Account Not Found");

        if (!user.isVerified) throw new Error("Oops, email not verified!");

        const checkPass = await bcrypt.compare(password, user?.password);
        if (!checkPass) throw new Error("Invalid Credential");

        let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret");

        res.cookie("token", token)

        return user;
    }

    @Authorized()
    @Query(() => User, { nullable: true })
    async me(@Ctx() { user }: MyContext) {
        return await User.findOneOrFail({ where: { id: user.id } },);
    }

    @Authorized()
    @Mutation(() => Boolean, { nullable: true })
    async editProfile(@Ctx() { user }: MyContext, @Arg("data") data: EditProfileInput) {
        const { affected } = await User.update(user.id, { ...data })
        return affected === 1;
    }

    @Mutation(() => Boolean)
    async reqForgotPassVerification(@Arg("data") { email }: RequestForgotPassInput) {
        const user = await User.findOneOrFail({ where: { email } });

        const passUUID = cuid();
        await User.update(user.id, { passUUID });

        const { name, id } = user;
        await User.sendForgotResetMail({ name, email, id, verifyToken: passUUID });
        return true;
    }

    @Mutation(() => Boolean)
    async resetPassword(@Arg("data") { token, newPassword }: ResetPasswordInput) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
        const user = await User.findOneOrFail({ where: { id: decoded.id } });

        if (user.passUUID === decoded.verifyToken) {
            const password = await bcrypt.hash(newPassword, 13);
            const { affected } = await User.update(user.id, { password });
            return affected === 1
        }
        return false;
    }

    @Mutation(() => Boolean)
    async logoutUser(@Ctx() { res }: MyContext) {
        res.cookie("token", "", { httpOnly: true, maxAge: 1 })

        return true;
    }

    @Authorized()
    @Query(() => GetUsersOutput, { nullable: true })
    async leaderBoard(
        @Arg("skip", { nullable: true }) skip: number,
        @Arg("limit", { nullable: true }) take: number
    ) {
        const users = await User.find({ where: { role: UserRole.SELECTED }, skip, take, order: { totalPoints: "DESC" } });
        const count = await User.count({ where: { role: UserRole.SELECTED } });
        return { users, count };
    }

    @Query(() => GetUsersOutput, { nullable: true })
    async getUsers(
        @Arg("filter", { nullable: true }) filter: GetUsersFilter,
        @Arg("skip", { nullable: true }) skip: number,
        @Arg("limit", { nullable: true }) take: number) {

        const users = await User.find({ where: { ...filter }, skip, take });

        const count = await User.count({ where: filter });
        return { users, count };
    }

    @Authorized(["ADMIN"])
    @Query(() => Number)
    async getUsersCount(@Arg("filter") filter: GetUsersFilter) {
        return await User.count({ where: filter });
    }

    @Authorized(["ADMIN"])
    @Query(() => User, { nullable: true })
    async getUser(@Arg("userId") userId: string) {
        return await User.findOneOrFail(userId);
    }

    @Authorized(["ADMIN"])
    @Query(() => [User], { nullable: true })
    async searchUser(@Arg("search") search: string) {
        let users: User[] = [];
        await Promise.all(User.fields.map(async (field) => {    //user fields = [ ca-id, name, email, city, college, coord ]
            const filter = { [field]: Like(`%${search}%`) };
            const userF = await User.find({ where: filter });
            userF.forEach((user) => { users.push(user) })
        }));

        const userStr = users.map((obj) => JSON.stringify(obj));
        const uniqueUserStr = new Set(userStr);
        return Array.from(uniqueUserStr).map((str) => JSON.parse(str));
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async applicationResult(@Arg("data") { isSelected, id, coord }: ApplicationResultInput) {
        const user = await User.findOneOrFail({ where: { id } });

        if (user) {
            if (user.role === UserRole.SELECTED) throw new Error("Oops, Selection done already!")

            await User.sendSelectionMail({ name: user.name, email: user.email, isSelected });
            if (isSelected) {
                const count = await User.count({ where: { role: UserRole.SELECTED } });
                var caidNum = ("0000" + (count + 1)).slice(-4);
                const caID = `S22CA${caidNum}`;

                const { affected } = await User.update(user?.id, { role: UserRole.SELECTED, caID, coord })
                return affected === 1;
            } else {
                const { affected } = await User.update(user?.id, { role: UserRole.REJECTED });
                return affected === 1;
            }
        } else throw new Error("User not found")
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async allocatePoints(@Arg("data") { id, points }: AllocatePointsInput) {
        const user = await User.findOneOrFail({ where: { id } });

        if (user) {
            const { affected } = await User.update(user.id, { totalPoints: user.totalPoints + points });
            return affected === 1;
        } else throw new Error("User not found")
    }

    @Authorized()
    @Mutation(() => Boolean)
    async deleteUser(@Arg("deleteUser") deleteUser: boolean, @Ctx() { user }: MyContext) {
        if (deleteUser) {
            const { affected } = await User.delete(user.id);
            return affected === 1;
        }
        return false
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async editCoordAllocation(@Arg("data") { id, coord }: EditCoordAllocationInput) {
        const user = await User.findOneOrFail({ where: { id } });
        if (user) {
            if (user.role === UserRole.SELECTED) {
                const { affected } = await User.update(user, { coord })
                return affected === 1;
            } else throw new Error("User is not selected as CA")
        } else throw new Error("User not found")
    }

    @Authorized(["ADMIN"])
    @Query(() => String)
    async getUsersDataCSV() {
        const users = await User.find({ select: ["name", "caID", "email", "role", "totalPoints", "coord", "referral"] });
        return parse(users);
    }

    @FieldResolver(() => Questionnaire)
    async questionnaire(@Root() { id }: User) {
        return Questionnaire.find({ where: { user: id } });
    }

    @FieldResolver(() => [TaskReview])
    async taskReviews(@Root() { id }: User) {
        return await TaskReview.find({ where: { user: id } });
    }

}