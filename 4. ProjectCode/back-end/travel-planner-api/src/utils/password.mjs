import crypto from "crypto";

const ITERATIONS = 160000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

function pbkdf2(password, salt, iterations) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(derivedKey.toString("hex"));
    });
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await pbkdf2(password, salt, ITERATIONS);
  return `${ITERATIONS}:${salt}:${derivedKey}`;
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== "string") {
    return false;
  }

  const [iterationsRaw, salt, hash] = stored.split(":");
  const iterations = Number.parseInt(iterationsRaw, 10);

  if (!iterations || !salt || !hash) {
    return false;
  }

  const derivedKey = await pbkdf2(password, salt, iterations);
  const hashBuffer = Buffer.from(hash, "hex");
  const derivedBuffer = Buffer.from(derivedKey, "hex");

  if (hashBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, derivedBuffer);
}
