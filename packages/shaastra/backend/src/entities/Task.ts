import { TaskStatus } from "../utils";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn  } from "typeorm";
import { TaskReview } from "./Taskreview";

@Entity("Task")
@ObjectType("Task")
export class Task extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id: string;

    @Column()
    @Field()
    brief: string;
  
    @Column()
    @Field()
    details: string;
  
    @CreateDateColumn()
    @Field()
    createdOn: string;
  
    @Column("timestamptz")
    @Field()
    deadline: string;

    @Column()
    @Field()
    maxPoints: number;

    @Field()
    status(): TaskStatus {
        const d1 = new Date(this.deadline);
        const d2 = new Date()
        if(d1.getTime() <= d2.getTime()) return TaskStatus.CLOSED
        return TaskStatus.PENDING
    }

    //relations
    @OneToMany(() => TaskReview, taskreview => taskreview.task, { cascade: true })
    taskReviews: TaskReview[];

}