import UserDBService from "../user/user-db-service.js";
import { sanitizeUserForToken, signJwt } from "../../utils/jwt-utils.js";
import nodemailer from "nodemailer";

export default class UserController {
    constructor() { }

    static async getUsers(req, res) {
        const users = await UserDBService.fetchAllUsers();
        console.log(users)
        if (!users) {
            return res.status(404).json({ message: "No users found!" });
        }

        return res.status(200).json({ users });
    }

    static async createUser(req, res) {
        const {
            username,
            firstname,
            lastname,
            age,
            gender,
            email,
            phone,
            password,
            imageBase64,
            isCoach,
        } = req.body;

        if (
            !username ||
            !firstname ||
            !lastname ||
            !age ||
            !gender ||
            !email ||
            !phone ||
            !password ||
            !imageBase64 ||
            isCoach === undefined
        ) return res
            .status(400)
            .json({ message: "Missing data, all fields are required!" });

        const response = await UserDBService.insertUser(req.body);
        if (!response) return res.status(500).json({ message: "User creation failed!" });
        if (!response.success) return res.status(400).json({ message: response.message });

        const safeUser = sanitizeUserForToken(response.user);
        const token = signJwt({ user: safeUser });

        return res.status(200).json({ token });
    }

    static async loginUser(req, res) {
        const { authentication, password } = req.body;

        if (!authentication || !password) {
            return res
                .status(400)
                .json({ message: "Missing data, all fields are required!" });
        }

        const response = await UserDBService.loginUser({
            authentication,
            password,
        });
        if (!response) {
            return res.status(500).json({ message: "User login failed!" });
        }
        if (!response.success) {
            return res.status(401).json({ message: response.message });
        }

        const safeUser = sanitizeUserForToken(response.user);
        const token = signJwt({ user: safeUser });

        return res.status(200).json({ token });
    }

    static async deleteUser(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: "User id is required!" });
        }
        const result = await UserDBService.destroyUser(id);
        if (!result) {
            return res
                .status(404)
                .json({ message: "No user with this id in database!" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    }

    static async updateUser(req, res) {
        const id = req.params.id;
        const details = req.body;

        if (!id) {
            return res.status(400).json({ message: "User id is required!" });
        }

        if (
            !details ||
            Object.values(details).every(
                (val) =>
                    val === undefined ||
                    val === null ||
                    (typeof val === "string" && val.trim() === "") ||
                    (typeof val === "number" && val <= 0)
            )
        ) {
            return res.status(400).json({ message: "No changes were submitted!" });
        }

        const updatedUser = await UserDBService.updateUser(id, details);

        if (!updatedUser) {
            return res
                .status(404)
                .json({ message: "No user with this id in database!" });
        }

        const safeUser = sanitizeUserForToken(updatedUser);
        const token = signJwt({ user: safeUser });

        return res.status(200).json({ token });
    }

    static async sendRecoveryCode(req, res) {
        try {
            const { email, recoveryCode } = req.body;
            if (!email || !recoveryCode) {
                return res
                    .status(400)
                    .json({ message: "Email and recovery code are required." });
            }

            const emailExists = await UserDBService.checkEmail(email);
            if (!emailExists) {
                return res.status(404).json({ message: "Email not found." });
            }

            // Create reusable transporter object using SMTP transport
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.SERVER_EMAIL,
                    pass: process.env.SERVER_EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.SERVER_EMAIL,
                to: email,
                subject: "Password recovery - Pro Manager",
                text:
                    `Your password recovery code is:\n${recoveryCode}\n` +
                    "Please enter this code in the app to start the password recovery process!",
            };

            await transporter.sendMail(mailOptions);

            return res
                .status(200)
                .json({ message: "Recovery code sent successfully." });
        } catch (err) {
            console.error("sendRecoveryCode error:", err);
            return res.status(500).json({
                message: "An unexpected error occurred.",
                details: err.message,
            });
        }
    }

    static async updateUserByEmail(req, res) {
        const details = req.body;

        if (!details) {
            return res.status(400).json({ message: "Changes details are required!" });
        }

        if (
            !details ||
            Object.values(details).every(
                (val) =>
                    val === undefined ||
                    val === null ||
                    (typeof val === "string" && val.trim() === "") ||
                    (typeof val === "number" && val <= 0)
            )
        ) {
            return res.status(400).json({ message: "No changes were submitted!" });
        }

        const updatedUser = await UserDBService.updatePasswordByEmail(details);

        if (!updatedUser) {
            return res
                .status(404)
                .json({ message: "No user with this email exists!" });
        }

        return res.status(200).json({ message: "Password successfully changed!" });
    }

    static async getProfile(req, res) {
        const userId = req.user?.id || req.user?.Id;

        if (!userId) {
            return res
                .status(401)
                .json({ message: "Unauthorized! No user ID found in token." });
        }

        const user = await UserDBService.fetchUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const userObj = {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            age: user.age,
            gender: user.gender,
            email: user.email,
            phone: user.phone,
            isCoach: user.isCoach,
            imageBase64: user.imageBase64,
        };

        return res.status(200).json({ user: userObj });
    }
}
