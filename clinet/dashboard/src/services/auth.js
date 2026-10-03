import axios from "axios";

const loginRequest = async (data) => {
  return await axios.post("/api/login-request", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const loginVerify = async (data) => {
  return await axios.post("/api/login-verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const acceptInvite = async (data) => {
  return await axios.post("/api/accept-invite", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const auth = {
  loginRequest: loginRequest,
  loginVerify: loginVerify,
  acceptInvite: acceptInvite,
};

export default auth;
