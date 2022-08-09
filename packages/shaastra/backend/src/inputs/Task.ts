import { Field, InputType } from "type-graphql";

@InputType("TaskInput")
export class CreateTaskInput {

    @Field()
    brief: string;

	@Field()
    details: string;

	@Field()
    deadline: string;

    @Field()
    maxPoints: number;
}

@InputType("SubmitTaskInput")
export class SubmitTaskInput {

    @Field()
    taskid: string;

	@Field(() => [String])
    taskurl: string[];
}

@InputType("ReviewTaskInput")
export class ReviewTaskInput {

    @Field()
    reviewid: string;

    @Field()
    review: string;
   
    @Field()
    points : number   
}

@InputType("FilterTaskReview")
export class FilterTaskReview {

    @Field({ nullable: true })
    reviewID: string;

    @Field({ nullable: true })
    user: string;

    @Field({ nullable: true })
    task: string;
}