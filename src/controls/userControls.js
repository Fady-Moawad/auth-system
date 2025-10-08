const Users = require('../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require("crypto")
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");
const sendEmail = require('../utils/nodemailer')

const getAllUsers = async (req, res,next) => {
    try {
        const users = await Users.find();
        return res.status(200).json({ users });
    } catch (error) {
        res.status(500)
        return next(error)
    }
};
const register = async (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        return next(errors);
    }

    try {
        const oldUser = await Users.findOne({ email });
        if (oldUser) {
            res.status(400);
            return next("Email already exists");
        }

        const verifyCode = crypto.randomInt(100000, 1000000).toString();
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({
            name,
            email,
            password: hashPassword,
            isVerified: false,
            verifyCode
        });

        await newUser.save();

        const message = `You requested a Verify Account.\n\nPlease copy this code: ${verifyCode}`;
        await sendEmail({
            email: newUser.email,
            subject: "Verify Account",
            message,
        });

        return res.status(201).json({ success: true, data: ['Check your email to verify your account'] });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};


// ✅ verifyAccount
const verifyAccount = async (req, res, next) => {
    const { code } = req.body;
    try {
        const user = await Users.findOne({ verifyCode: code });
        if (!user) {
            res.status(400);
            return next("Code is not correct");
        }

        user.isVerified = true;
        user.verifyCode = null;
        await user.save();

        const payload = { id: user._id, verify: user.isVerified, name: user.name, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({ data: token });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};


// ✅ login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email });

        if (!user) {
            res.status(400);
            return next("User not found");
        }

        if (!user.isVerified) {
            res.status(400);
            return next("Verify your account first, then login");
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            res.status(400);
            return next("Invalid password");
        }

        const payload = { id: user._id, name: user.name, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({ data: token });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};


// ✅ resendCode
const resendCode = async (req, res, next) => {
    const { email } = req.headers;
    try {
        const user = await Users.findOne({ email });
        if (!user) {
            res.status(400);
            return next("User not found");
        }

        const verifyCode = crypto.randomInt(100000, 1000000).toString();
        user.verifyCode = verifyCode;
        await user.save();

        const message = `You requested a Verify Account again.\n\nPlease copy this code: ${verifyCode}`;
        await sendEmail({
            email,
            subject: "Verify Account",
            message,
        });

        return res.status(201).json({ success: true, data: ['Check your email to verify your account'] });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};


// ✅ forgetPassword
const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        return next("Email is required");
    }

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            res.status(400);
            return next("User not found");
        }

        const resetCode = crypto.randomInt(100000, 1000000).toString();
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
        await user.save();

        const message = `You requested a password reset.\n\nPlease copy this code: ${resetCode}`;
        await sendEmail({
            email: user.email,
            subject: "Password Reset",
            message,
        });

        return res.status(200).json({ data: ["Email sent successfully"] });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};


// ✅ resetPassword
const resetPassword = async (req, res, next) => {
    const { code, password } = req.body;

    if (!code) {
        res.status(400);
        return next("Code is required");
    }

    if (!password) {
        res.status(400);
        return next("Password is required");
    }

    try {
        const user = await Users.findOne({ resetPasswordCode: code });
        if (!user) {
            res.status(400);
            return next("Invalid or expired code");
        }

        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        user.resetPasswordCode = null;
        await user.save();

        return res.status(200).json({ data: ["Password reset successful"] });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};


module.exports = {
    getAllUsers,
    login,
    register,
    forgetPassword,
    resetPassword,
    verifyAccount,
    resendCode
};
