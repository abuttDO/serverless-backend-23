import { TaskReview } from "../entities/Taskreview"
import { User } from "../entities/user";

const updateTotalPoints = async ( reviewID: string ) => {
    let totalPoints = 0;
    const taskReview = await TaskReview.findOneOrFail(reviewID, { relations: ["user"]});

    const taskReviews = await TaskReview.find({ where: { user: taskReview.user } });

    taskReviews.forEach((taskReview) => {
        totalPoints += taskReview.points
    });
    const { affected } = await User.update(taskReview.user, { totalPoints })
    return affected;
}

export default updateTotalPoints;