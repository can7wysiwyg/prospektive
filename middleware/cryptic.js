import crypto from 'crypto'

const secret = crypto.createHash("sha256")
  .update(String(process.env.USER_CRYPT_SECRET))
  .digest();

const iv = Buffer.alloc(16, 0); 

export const encryptId = (id) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', secret, iv);
  let encrypted = cipher.update(id, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decryptId = (encrypted) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', secret, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};


