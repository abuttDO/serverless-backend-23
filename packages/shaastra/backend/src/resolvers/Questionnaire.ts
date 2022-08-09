import { Questionnaire } from "../entities/Questionnaire";
import { Arg,Authorized,Ctx,Mutation, Query, Resolver } from "type-graphql";
import { QuestionnaireInput } from "../inputs/Questionnaire";
import { MyContext } from "../utils/context";


@Resolver()
export class QuestionnaireResolver{

    @Authorized()
    @Query(() => Questionnaire)
    async getQuestionnaire(@Ctx() { user } : MyContext) {
        const questionnaire = await Questionnaire.findOneOrFail({ where: { user: user.id } });
        return questionnaire;
    }

    @Authorized()
    @Mutation(() => Boolean)
    async fillQuestionnaire( @Arg("data") data: QuestionnaireInput, @Ctx() { user } : MyContext) {
        const questionnaire = await Questionnaire.create({ ...data, user }).save();
        return !!questionnaire;
    }

    //update questionaire
    @Authorized()
    @Mutation(() => Boolean)
    async updateQuestionnaire( @Arg("data") data: QuestionnaireInput, @Ctx() { user } : MyContext) {
        const questionnaire = await Questionnaire.update({user:user},{...data});
        return !!questionnaire;
    }


    //query for admin to fetch all questionnarie
    @Authorized(["ADMIN"])
    @Query(() => [Questionnaire])
    async getQuestionnaires() {
        return  await Questionnaire.find();
    }

    //query for admin to fetch questionnarie by id
    @Authorized(["ADMIN"])
    @Query(() => Questionnaire)
    async getQuestionnaireByUserId(@Arg("userid") userid : string) {
        const questionnaire = await Questionnaire.findOneOrFail({ where: { user: userid } });
        return questionnaire;
    }
    

    //user field resolver

}