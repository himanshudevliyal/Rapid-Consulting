import argon2 from "argon2";

const encrypt = async (data) => {
  if (!data) throw new Error("No data provided for hashing");

  return await argon2.hash(data, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
};

const verify = async (data, hash) => {
  if (!data || !hash) return false;
  return await argon2.verify(hash, data);
};

export default {
  encrypt: encrypt,
  verify: verify,
};
