import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn  } from "typeorm";
import { User } from "./user";

@Entity("questionnaire")
@ObjectType("questionnaire")
export class Questionnaire extends BaseEntity {
    
    @PrimaryGeneratedColumn ()
    @Field(() => ID)
    id: string;

    @Column()
    @Field()
    college: string;

    @Column()
    @Field()
    collegeaddress: string;

    @Column()
    @Field()
    city: string;

    @Column()
    @Field()
    state: string;

    @Column()
    @Field()
    Degree: string;

    @Column()
    @Field()
    branch: string;

    @Column()
    @Field()
    year: string;

    @Column()
    @Field()
    postaladdress: string;

    @Column()
    @Field()
    pcity: string;

    @Column()
    @Field()
    pstate: string;

    @Column()
    @Field()
    pincode: string;
    
    @Column()
    @Field()
    contactno: string;

    @Column()
    @Field()
    whatsappno: string;

    @Column()
    @Field()
    Q1: string;

    @Column()
    @Field()
    Q2: string;

    @Column()
    @Field()
    Q3: string;

    @Column()
    @Field()
    Q4: string;

    @Column()
    @Field()
    Q5: string;

    @Column()
    @Field()
    Q6: string;

    @OneToOne(() => User, user => user.questionnaire)
    @JoinColumn()
    user: User;
}