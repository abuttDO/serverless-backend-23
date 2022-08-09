import cuid from "cuid";
import bcrypt from "bcryptjs";
import { Field, ID, ObjectType } from "type-graphql";
import { SendConfirmationMailOptions, SendSelectionMailOptions, SendVerificationMailOptions, UserRole } from "../utils";
import jwt from "jsonwebtoken";
import { mail } from "../utils/mail";
import { BaseEntity, BeforeInsert, Column, Entity, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Questionnaire } from "./Questionnaire";
import { TaskReview } from "./Taskreview";

@Entity("User")
@ObjectType("User")
export class User extends BaseEntity {

    @BeforeInsert()
    async setId() {
      this.id = cuid();
      this.verficationToken = cuid();
      this.password = await bcrypt.hash(this.password, 13);
      function randomString() {
        const length = 8;
        const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        let result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
      }
      this.referral = randomString();
    }

    static async sendVerificationMail({ name, email, id, verifyToken } : SendVerificationMailOptions) {
      const token = jwt.sign({id, verifyToken}, process.env.JWT_SECRET || "secret", { expiresIn: '1h'});
      const body = `Hello <b>${name}</b>,<br><br>
                    Thanks for signing up!<br><br>
                    Kindly verify your email address by clicking the ‘Verify email address’ button below 
                    to begin your journey as a Campus Ambassador at IITM’s annual tech-fest, Shaastra 2022.<br>
                    <a href="https://ca22.shaastra.org/verify/${token}"><button>Verify</button></a><br><br>
                    Or verify using the link: https://ca22.shaastra.org/verify/${token}<br><br>
                    Reach out to us in case of any queries at outreach@shaastra.org<br><br>
                    Welcome!<br>
                    Publicity team | Shaastra 2022<br><br>
                    The verification link expires within 1 hour.`;
      await mail({email, sub: "Verify your email address || CA Program, Shaastra 2022, IIT Madras", body});
      console.log(token);
    }

    static async sendForgotResetMail({ name, email, id, verifyToken } : SendVerificationMailOptions) {
      const token = jwt.sign({id, verifyToken}, process.env.JWT_SECRET || "secret", { expiresIn: '0.5h'});
      const body = `Hello <b>${name}</b>,<br><br>
                    In case you forgot your password, you can reset it with a new password by 
                    clicking the ‘Reset my password’ button below.<br><br>
                    <a href="https://ca22.shaastra.org/forgotpassword/${token}"><button>Reset Password</button></a><br><br>
                    If you have not initiated this request, let us know at outreach@shaastra.org immediately.<br><br>
                    Reach out to us in case of any queries at outreach@shaastra.org<br><br>
                    Welcome!<br>
                    Publicity team | Shaastra 2022<br><br>
                    The verification link expires within 30 minutes`;
      await mail({email, sub: "Forgot your password || CA Program, Shaastra 2022, IIT Madras", body});
      console.log(token);
    }

    static async sendConfirmationMail({ name, email } : SendConfirmationMailOptions) {
      const body = `Hello <b>${name}</b>,<br><br>
                    <b>Greetings from Shaastra 2021, IIT Madras!</b><br><br>
                    Thank you for signing up for the Shaastra Campus Ambassador Program.
                    Please complete the questionnaire on the portal by “<Given Date>”(you
                    can sign-in using this email ID and the password given during sign-up),
                    which is mandatory for selection. Further instructions pertaining to the
                    selection process shall be intimated by mail. Meanwhile, please like and
                    follow our Facebook page: fb.com/Shaastra for updates. If you have any
                    queries, drop a mail at studentrelations@shaastra.org<br><br><br>
                    Regards,<br>
                    Team Shaastra,<br>
                    IIT Madras`;
      await mail({ email, sub: "Sign Up Confirmation || CA Program, Shaastra 2022, IIT Madras", body})
    }

    static async sendSelectionMail({ name, email, isSelected } : SendSelectionMailOptions) {
      const body = isSelected
                      ? `Hello <b>${name}</b>,<br><br>
                         <b>Greetings from Shaastra 2022, IIT Madras!</b><br><br>
                         Congratulations on being selected as a Campus Ambassador for your college!
                         We cordially welcome you to the team behind India’s largest completely
                         student-run technical extravaganza - Shaastra 2022.<br>
                         With a strong team of 500 students of IIT Madras and hundreds of Campus
                         Ambassadors across India, Shaastra 2021 aims to give the best technical
                         experience to everyone in the country ranging from school students to engineers
                         of the future. With this in mind, we hope you have an amazing journey working
                         with us as you represent your college.<br>
                         Further instructions and information would be communicated to you shortly.
                         We request you to keep checking the CA Portal as well as your email.
                         Looking forward to working with you.<br><br><br>
                         Regards,<br>
                         Team Shaastra,<br>
                         IIT Madras.`
                      : `Hello <b>${name}</b>,<br><br>
                         <b>Greetings from Shaastra, IIT Madras!</b><br><br>
                         We regret to inform you that your application for being a Shaastra Campus 
                         Ambassador couldn’t be accommodated. However, lose hope not, for you
                         can try again next year which will undoubtedly see a bigger CA Program.
                         Get a feel of Shaastra - visit the IIT Madras campus in January and
                         experience the largest.<br>
                         student-run technical extravaganza. With a host of workshops, international
                         competitions, lectures, exhibitions and shows, Shaastra is bound to amaze
                         you.<br>
                         We look forward to seeing you at Shaastra 2022, and as a Campus
                         Ambassador next year<br><br><br>
                         Regards,<br>
                         Team Shaastra,<br>
                         IIT Madras`;
      await mail({ email, sub: "Campus Ambassador Program || Shaastra 2022, IIT Madras", body})
    }

    static fields = ["name", "email", "coord"]
  
    @PrimaryColumn()
    @Field(() => ID)
    id: string;

    @Column({ unique: true, nullable: true })
    //@Field({ nullable: this.role === UserRole.SELECTED ? false : true })
    @Field({ nullable: true })
    caID: string;
  
    @Column()
    @Field()
    name: string;
  
    @Column({ unique: true })
    @Field()
    email: string;

    @Column()
    password: string;

    @Column({ default: false})
    @Field()
    isVerified: boolean;

    @Column("enum", { enum: UserRole, default: UserRole.REGISTERED })
    @Field()
    role: UserRole;

    @Column({nullable: true})
    verficationToken: string;

    @Column({nullable: true})
    passUUID: string;

    @Column({nullable: true})
    @Field({nullable: true})
    totalPoints: number;

    @Column({ nullable: true })
    @Field({ nullable: true })
    coord: string;

    @Column()
    @Field()
    referral: string;

    //relations
    @OneToOne(() => Questionnaire, questionnaire => questionnaire.user)
    questionnaire: Questionnaire;

    @OneToMany(() => TaskReview, taskreview => taskreview.user)
    taskReviews: TaskReview[];
}
