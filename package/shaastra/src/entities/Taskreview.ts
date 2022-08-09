//import { Max } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column,Entity, ManyToOne, PrimaryGeneratedColumn  } from "typeorm";
import { Task } from "./Task";
import { User } from "./user";


@Entity("TaskReview")
@ObjectType("TaskReview")
export class TaskReview extends BaseEntity {

    //max = this.task.Maxpoints
    
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    reviewID: string;

    @Column({nullable:true})
    @Field({nullable:true})
    review : string;

    @Column()
    @Field()
    taskurl : string;

    @Column({nullable:true})
    @Field({defaultValue:0})
    points : number;

    //relations
    @ManyToOne(() => User, user => user.taskReviews)
    user: User;

    @ManyToOne(() => Task, task => task.taskReviews, {onDelete: "CASCADE"})
    task: Task;

}