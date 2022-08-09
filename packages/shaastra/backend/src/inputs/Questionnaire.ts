import { Field, InputType } from "type-graphql";

@InputType("QuestionnaireInput")
export class QuestionnaireInput{

    @Field()
    college: string;
	
    @Field()
    collegeaddress: string;

    @Field()
    city: string;

    @Field()
    state: string;

    @Field()
    Degree: string;

    @Field()
    branch: string;

    @Field()
    year: string;

    @Field()
    postaladdress: string;

    @Field()
    pcity: string;

    @Field()
    pstate: string;

    @Field()
    pincode: string;
    
    @Field()
    contactno: string;

    @Field()
    whatsappno: string;

    @Field()
    Q1: string;

    @Field()
    Q2: string;

    @Field()
    Q3: string;

    @Field()
    Q4: string;

    @Field()
    Q5: string;

    @Field()
    Q6: string;
}

