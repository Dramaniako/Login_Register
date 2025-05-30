import dotenv from "dotenv";
dotenv.config();

import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

export const Register = async (req, res) => {
    console.log("--- Register controller function was HIT! ---"); // <--- ADD THIS LINE
    console.log("Request body received:", req.body);             // <--- AND THIS LINE

    const { name, email, password, confPassword } = req.body; // Or use 'confirmPassword' if you change it
    // ... rest of your code
    if (password !== confPassword) { // Adjust variable if you changed it above
        console.log("Password mismatch check triggered.");
        return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
    }
    // ... rest of your code
    try {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        console.log("Attempting to create user...");
        await Users.create({
            name: name,
            email: email,
            password: hashPassword // Ensure hashPassword is defined from bcrypt
        });
        console.log("User creation successful.");
        res.status(201).json({ msg: "Register Berhasil" }); // Changed to 201 for resource creation
    } catch (error) {
        console.error("Error during Users.create:", error); // Log the full error
        res.status(500).json({ msg: "Server error during registration" }); // Send error response
    }
}

export const Login = async (req, res) => {
    console.log("Access Token Secret:", process.env.ACCESS_TOKEN_SECRET);
    console.log("Refresh Token Secret:", process.env.REFRESH_TOKEN_SECRET);
    try {
        const emailInput = req.body.email.trim().toLowerCase();
        const passwordInput = req.body.password;

        console.log("Email from request:", emailInput);
        console.log("Password from request:", passwordInput);

        const user = await Users.findOne({
            where: {
                email: emailInput
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "email tidak ditemukan" });
        }

        const match = await bcrypt.compare(passwordInput, user.password);
        if (!match) return res.status(400).json({ msg: "wrong password" });

        const userId = user.id;
        const name = user.name;
        const email = user.email;
        const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '50s'
        });
        const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        await Users.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ msg: "Terjadi kesalahan saat login" });
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}
