import jwt from "jsonwebtoken";

type dataProps = {
  id: number;
};

export const generateJWT = (data:dataProps) => {

  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "180d" });
  return token;
};
