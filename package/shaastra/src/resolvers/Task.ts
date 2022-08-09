import { Task } from "../entities/Task";
import { Arg, Authorized, Ctx, FieldResolver, Mutation,Query,Resolver, Root } from "type-graphql";
import { MyContext } from "../utils/context";
import { TaskReview } from "../entities/Taskreview";
import { CreateTaskInput, FilterTaskReview, ReviewTaskInput, SubmitTaskInput } from "../inputs/Task";
import { TaskStatus, UserRole } from "../utils";
import updateTotalPoints from "../utils/getTotalPoints";

@Resolver(Task)
export class TaskResolver{

    @Authorized(["ADMIN"])
    @Mutation(()=> Boolean)
    async createTask(@Arg("data") data: CreateTaskInput) {
        const task = await Task.create({ ...data }).save();
        return !!task;
    }

    // update task details
    @Authorized(["ADMIN"])
    @Mutation(()=> Boolean)
    async editTask(@Arg("data") data: CreateTaskInput, @Arg("taskid") taskid : string) {
        const { affected } = await Task.update(taskid, { ...data } );
        return affected === 1;
    }

    @Authorized()
    @Query(()=>[Task])
    async getTasks(
        @Ctx() { user }: MyContext,
        @Arg("skip", { nullable: true }) skip: number,
        @Arg("limit", { nullable: true }) take: number ) {
        let tasks = await Task.find({ order: { id: "ASC" } });
        await Promise.all(tasks.map(async (task) => {
            const count = await TaskReview.count({ where: { task: task.id, user: user.id } })
            if( count !== 0 ) task.status = () => TaskStatus.SUBMITTED
        }));
        return tasks.slice( skip, take + skip );
    }

    //get task by task id
    @Authorized()
    @Query(()=>Task)
    async getTask(@Arg("taskid") taskid : string) {                
        const task = await Task.findOneOrFail(taskid)
        return task;
    }

    @Authorized()
    @Query(()=>[TaskReview])
    async getTaskreview( @Arg("filter") filter: FilterTaskReview, @Ctx() { user } : MyContext ) {

        if(user.role === UserRole.ADMIN) return await TaskReview.find({ where: {...filter }, relations: ["user"] });

        filter.user = user.id;
        return await TaskReview.find({ where: {...filter } });;
    }

    @Authorized()
    @Mutation(()=> Boolean)
    async submitTask(
      @Arg("data") { taskid, taskurl } : SubmitTaskInput,
      @Ctx() { user } : MyContext
      ) {
        const task = await Task.findOneOrFail({ where: { id: taskid }});

        if(task.status() === TaskStatus.CLOSED) throw new Error("Task submission deadline over");

        const count = await TaskReview.count( { where: { task: taskid, user: user.id}});
        if(count !== 0 ) throw new Error("Task Submitted");

        const taskurlC = taskurl.join(" ");
        const taskreview = await TaskReview.create({ task, taskurl: taskurlC, user }).save();
        
       return !!taskreview;
    }

    @Authorized()
    @Mutation(() => Boolean)
    async editTaskSubmission(
        @Arg("data") { taskid, taskurl } : SubmitTaskInput,
        @Ctx() { user } : MyContext
    ) {
        const task = await Task.findOneOrFail({ where: { id: taskid }});

        if(task.status() === TaskStatus.CLOSED) throw new Error("Task submission deadline over");

        const taskReview = await TaskReview.findOneOrFail( { where: { task: taskid, user: user.id } });

        const taskurlC = taskurl.join(" ");
        const { affected } = await TaskReview.update( taskReview?.reviewID, { taskurl: taskurlC});
        
       return affected === 1;
    }

    @Authorized(["ADMIN"])
    @Mutation(()=> Boolean)
    async reviewTask( @Arg("data") { reviewid, review, points } : ReviewTaskInput ) {
        const { affected } = await TaskReview.update(reviewid , { review , points});
        let updated;
        if( affected === 1 ) {
            updated = await updateTotalPoints(reviewid)
        };
        
       return affected === 1 && updated === 1;
    }

    @FieldResolver(() => [TaskReview])
    async taskReviews(@Root() { id }: Task, @Ctx() { user }: MyContext) {
        if(user.role === UserRole.ADMIN) return await TaskReview.find({ where: { task: id } });
        return await TaskReview.find({ where: { task: id, user: user.id}})
    }

    @Authorized(["ADMIN"])
    @FieldResolver(() => Number)
    async taskReviewsCount(@Root() { id }: Task) {
        return await TaskReview.count({ where: { task: id }});
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async deleteTask( @Arg("taskid") taskid : string) {
        const {affected} = await Task.delete(taskid);
        return (affected === 1);
    }
}