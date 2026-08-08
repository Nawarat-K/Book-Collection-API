import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectionPool from "../utils/db.js";

const authRouter = Router();

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeUser(user) {
  return {
    userId: user.user_id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
  };
}

function validateRegisterBody(body) {
  const username = cleanText(body.username).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = cleanText(body.firstName);
  const lastName = cleanText(body.lastName);

  if (!username || !password || !firstName || !lastName) {
    return {
      error: "username, password, firstName and lastName are required",
    };
  }

  if (username.length < 3 || username.length > 40) {
    return {
      error: "username must contain 3 to 40 characters",
    };
  }

  if (password.length < 8) {
    return {
      error: "password must contain at least 8 characters",
    };
  }

  return {
    data: {
      username,
      password,
      firstName,
      lastName,
    },
  };
}

function validateLoginBody(body) {
  const username = cleanText(body.username).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return {
      error: "username and password are required",
    };
  }

  return {
    data: {
      username,
      password,
    },
  };
}

// สมัครสมาชิก
authRouter.post("/register", async (req, res) => {
  const input = validateRegisterBody(req.body);

  if (input.error) {
    return res.status(400).json({
      message: input.error,
    });
  }

  try {
    const passwordHash = await bcrypt.hash(input.data.password, 10);

    const result = await connectionPool.query(
      `
      INSERT INTO users (username, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, username, first_name, last_name
      `,
      [
        input.data.username,
        passwordHash,
        input.data.firstName,
        input.data.lastName,
      ],
    );
    return res.status(201).json({
      message: "User has been created",
      data: safeUser(result.rows[0]),
    });
  } catch (error) {
    console.error("[POST /auth/register] error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Username already exists",
      });
    }
    return res.status(500).json({
      message: "Server could not register user",
      error: error.message,
    });
  }
});

// เข้าสู่ระบบ
authRouter.post("/login", async (req, res) => {
  const input = validateLoginBody(req.body);

  if (input.error) {
    return res.status(400).json({
      message: input.error,
    });
  }

  try {
    const result = await connectionPool.query(
      `
      SELECT 
        user_id,
        username,
        password_hash,
        first_name,
        last_name
      FROM users
      WHERE username = $1
      `,
      [input.data.username],
    );

    const user = result.rows[0];
    console.log("Result before encrypt", user);

    if (!user) {
      console.log("user wrong", user);
      return res.status(401).json({
        message: "Incorrect username or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      input.data.password,
      user.password_hash,
    );
    console.log("passwordmatch", passwordMatches);
    if (!passwordMatches) {
      return res.status(401).json({
        message: "Incorrect username or password",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback_development_secret";

    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      },
    );

    return res.status(200).json({
      message: "Login Successfully",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error(error.message);
    console.log("JWT_SECRET value:", process.env.JWT_SECRET);
    return res.status(500).json({
      message: "Server could not login",
    });
  }
});

export default authRouter;
