import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const tokenExpiration = (tokenExpirationDate: Date): string => {
  const currentDate = new Date();
  if ( currentDate.getTime() > tokenExpirationDate.getTime()) {
    return "expired"
  }
  return "notExpired"  
};

export const checkPassword = async (enteredPassword: string, storedHash: string) => {
  return await  bcrypt.compare(enteredPassword, storedHash)
};