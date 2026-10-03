"use strict";

import hash from "../../lib/encryption/index.js";
import authToken from "../../helpers/auth.js";
import {
  baseUserSchema,
  registerVerifySchema,
} from "../../validation-schema/user.schema.js";
import { sequelize } from "../../db/postgres.js";
import moment from "moment";
import { otpGenerator } from "../../utils/otp-generator.js";
import { sendOtp } from "../../services/otp-sender.js";
import {
  sendResetPasswordEmail,
  sendResetUsernameEmail,
} from "../../services/mailer.js";
import { StatusCodes } from "http-status-codes";
import table from "../../db/models.js";
import z from "zod";

const verifyUserCredentials = async (req, res) => {
  const { username, password, provider, provider_account_id, email, role } =
    req.body;
  let userData = null;
  let transaction = null;
  try {
    if (username && password) {
      userData = await table.UserModel.getByUsername(username);
      if (!userData) {
        return res
          .code(404)
          .send({ message: "User with this username does not exist." });
      }
      if (userData.role !== req.body.role) {
        return res.code(404).send({ message: "User not found." });
      }

      // 🚨 If user registered via social, tell them to use social login
      if (userData.provider && userData.provider !== "credentials") {
        return res.code(400).send({
          message: `Please login using ${userData.provider} instead of username and password.`,
        });
      }

      const passwordIsValid = await hash.verify(password, userData.password);
      if (!passwordIsValid) {
        return res.code(401).send({
          message: "Invalid Credentials.",
        });
      }
    } else if (provider && provider_account_id && email) {
      userData = await table.UserModel.getByEmailId(req);
      transaction = await sequelize.transaction();
      if (!userData) {
        userData = await table.UserModel.create(req, { transaction });
        const freePlan = await table.UserModel.getByFreePlan();
        const currDate = moment();
        const startDate = currDate.toISOString();
        const endDate = currDate.add(7, "days");
        await table.UserModel.create(
          {
            user_data: { id: userData.id },
            body: {
              plan_id: freePlan.id,
              plan_tier: freePlan.plan_tier,
              start_date: startDate,
              end_date: endDate,
              duration_in_months: 0,
            },
          },
          { transaction },
        );
      } else {
        if (!userData.provider) {
          await table.UserModel.update(
            { body: { provider, provider_account_id } },
            userData.id,
            transaction,
          );
        }
      }
      if (transaction) {
        await transaction.commit();
      }
    } else {
      return res.code(400).send({ message: "Invalid login request." });
    }

    delete userData.password;
    delete userData.created_at;
    delete userData.updated_at;

    const userPayload = { ...userData };

    const [jwtToken, expiresIn] = authToken.generateAccessToken(userPayload);
    const [refreshToken, refreshExpireTime] =
      authToken.generateRefreshToken(userPayload);

    return res.send({
      token: jwtToken,
      expire_time: Date.now() + expiresIn,
      refresh_token: refreshToken,
      refresh_expire_time: Date.now() + refreshExpireTime,
      user_data: userData,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
};

const register = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = baseUserSchema.parse(req.body);
    const record = await table.UserModel.getByUsername(validateData.username);
    if (record) {
      throw new Error(
        "User already exists with username. Please try with different username",
      );
    }

    const user = await table.UserModel.create(req, transaction);

    await transaction.commit();

    delete user.password;
    res.send(user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const acceptInvite = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = baseUserSchema
      .extend({ token: z.string().min(1, { error: "Token is required." }) })
      .parse(req.body);
    const record = await table.UserModel.getByUsername(validateData.username);
    if (record) {
      return res.code(409).send({
        message:
          "User already exists with username. Please try with different username",
      });
    }

    const invitationRecord = await table.InvitationModel.getByToken(
      validateData.token,
    );
    if (!invitationRecord) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Invitation not found." });
    }

    const isTokenExpired = moment(invitationRecord.expires_at).isBefore();
    if (isTokenExpired) {
      return res
        .code(StatusCodes.CONFLICT)
        .send({ status: false, message: "Invitation expired." });
    }

    req.body.role = invitationRecord.role;
    const user = await table.UserModel.create(req, transaction);

    await table.InvitationModel.update(
      { body: { status: "accepted" } },
      invitationRecord.id,
      transaction,
    );

    // throw new Error("wekfbwebhj");
    await transaction.commit();
    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Registered successfully." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const loginRequest = async (req, res) => {
  try {
    const userData = await table.UserModel.getByMobileNumber(req);
    if (!userData) {
      return res
        .code(409)
        .send({ message: "User with this number not exists." });
    }

    const otp = otpGenerator();
    const otpRecord = await table.UserModel.create({
      mobile_number: req.body.mobile_number,
      otp,
      type: "login",
      user_id: userData.id,
    });
    // await sendOtp({ phone: req.body.mobile_number, otp });
    res.send({ status: true, message: "OTP Sent.", request_id: otpRecord.id });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const loginVerify = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const otp = req.body.otp;
    const requestId = req.body.request_id;
    const otpRecord = await table.UserModel.getById(requestId);
    if (!otpRecord)
      return res
        .code(404)
        .send({ status: false, message: "Request not found!" });

    if (moment().isAfter(otpRecord.expires_at)) {
      return res.code(400).send({ status: false, message: "OTP Expired!" });
    }

    if (otpRecord.otp != otp) {
      return res
        .code(400)
        .send({ status: false, message: "Incorrect OTP Code!" });
    }
    await table.UserModel.update({ body: { verified: true } }, otpRecord.id);
    const userData = await table.UserModel.getById(0, otpRecord.user_id);
    if (!userData.is_active) {
      return res.code(StatusCodes.FORBIDDEN).send({
        status: false,
        message: "Unable to login, Please contact administrator.",
      });
    }

    // const planTier = await table.UserModel.getLastActivePlanByUserId(
    //   userData.id
    // );
    // const allowedSessions =
    //   constants.plan_limits[planTier?.plan_tier ?? "unsubscribed"];
    // const sessions = await table.UserModel.getByUserId(userData.id);
    // if (sessions.length >= allowedSessions) {
    //   const toRemove = sessions[0].id;
    //   await table.UserModel.deleteById(toRemove, transaction);
    // }
    // const session = await table.UserModel.create(userData.id, transaction);

    const userPayload = {
      ...userData,
      // session_id: session.id,
    };

    const [jwtToken, expiresIn] = authToken.generateAccessToken(userPayload);
    const [refreshToken, refreshExpireTime] =
      authToken.generateRefreshToken(userPayload);

    await transaction.commit();
    return res.send({
      token: jwtToken,
      expire_time: Date.now() + expiresIn,
      refresh_token: refreshToken,
      refresh_expire_time: Date.now() + refreshExpireTime,
      user_data: userData,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const registerRequest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = baseUserSchema.parse(req.body);

    const isUsernameExist = await table.UserModel.isUsernameExist(
      validateData.username,
    );
    if (isUsernameExist) {
      return res
        .code(409)
        .send({ message: "User with this username already exists." });
    }

    const isMobileNumberExist = await table.UserModel.isMobileNumberExist(
      validateData.mobile_number,
    );
    if (isMobileNumberExist) {
      return res
        .code(409)
        .send({ message: "User with this mobile number already exists." });
    }

    const isEmailExist = await table.UserModel.isEmailExist(validateData.email);
    if (isEmailExist) {
      return res
        .code(409)
        .send({ message: "User with this email already exists." });
    }

    const otp = otpGenerator();
    const otpRecord = await table.UserModel.create({
      mobile_number: validateData.mobile_number,
      otp,
      type: "register",
    });
    await sendOtp({ phone: validateData.mobile_number, otp });
    res.send({ status: true, message: "OTP Sent.", request_id: otpRecord.id });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const registerVerify = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = registerVerifySchema.parse(req.body);
    const otp = req.body.otp;
    const requestId = req.body.request_id;
    const otpRecord = await table.UserModel.getById(requestId);
    if (!otpRecord)
      return res
        .code(404)
        .send({ status: false, message: "Request not found!" });

    if (moment().isAfter(otpRecord.expires_at)) {
      return res.code(400).send({ status: false, message: "OTP Expired!" });
    }

    if (otpRecord.otp != otp) {
      return res
        .code(400)
        .send({ status: false, message: "Incorrect OTP Code!" });
    }

    await table.UserModel.update({ body: { verified: true } }, otpRecord.id);
    const userData = await table.UserModel.create(req, { transaction });

    await transaction.commit();
    // await Brevo.sendWelcomeEmail(
    //   userData.email,
    //   `${userData.first_name ?? ""} ${userData.last_name ?? ""}`
    // );
    // await waffly.sendWelcomeWhatsapp({
    //   phone: userData.mobile_number,
    // });
    res.send({ message: "User created successfully." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const verifyRefreshToken = async (req, res) => {
  return authToken.verifyRefreshToken(req, res);
};
const sendResetToken = async (req, res, type) => {
  const transaction = await sequelize.transaction();
  try {
    const record = await table.UserModel.getByEmailId(req);
    if (!record || record.provider !== "credentials") {
      return res
        .code(401)
        .send({ status: false, message: "Email not registered!" });
    }
    const [jwtToken, expiresIn] = authToken.generateAccessToken(record);
    const updateConfirmation = await table.UserModel.update(
      { body: { reset_password_token: jwtToken } },
      record.id,
      transaction,
    );

    if (updateConfirmation) {
      if (type === "password") {
        await sendResetPasswordEmail(record.email, jwtToken, record.role);
      } else {
        await sendResetUsernameEmail(record.email, jwtToken, record.role);
      }
    }
    await transaction.commit();
    return res.send({
      status: true,
      message:
        "We have sent an reset password link to your registered email id.",
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  verifyUserCredentials: verifyUserCredentials,
  register: register,
  registerRequest: registerRequest,
  registerVerify: registerVerify,
  verifyRefreshToken: verifyRefreshToken,
  acceptInvite: acceptInvite,
  loginRequest: loginRequest,
  loginVerify: loginVerify,
  sendResetToken: sendResetToken,
};
