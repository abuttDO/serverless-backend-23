import { MailResolver } from "./Mail";
import { QuestionnaireResolver } from "./Questionnaire";
import { TaskResolver } from "./Task";
import { UserResolver } from "./users";

export default [
    QuestionnaireResolver,
    TaskResolver,
    UserResolver,
    MailResolver
] as const;