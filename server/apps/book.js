import { Router } from "express";
import connectionPool from "../utils/db.js";
import { protect } from "../middleware/protect.js";

const bookRouter = Router();
const allowedStatuses = ["Reading", "Want to read"];

bookRouter.use(protect);

bookRouter.get("/", async (req, res) => {
  const { status, search } = req.query;
  const username = req.user?.username || req.user?.user_username;

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "status must be Reading or Want to read",
    });
  }

  try {
    const result = await connectionPool.query(
      `SELECT * 
        FROM books
        WHERE user_username = $1
        `,
      [username],
    );
    let books = result.rows;

    if (status) {
      books = books.filter((book) => book.status === status);
    }

    if (search) {
      const keyword = search.toLowerCase();
      books = books.filter((book) => {
        const title = book.title.toLowerCase();
        const author = book.author.toLowerCase();

        return title.includes(keyword) || author.includes(keyword);
      });
    }
    return res.status(200).json({
      message: "Get all books successfully",
      data: books,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

bookRouter.get("/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const username = req.user?.username || req.user?.user_username;

  if (isNaN(bookId) || bookId <= 0) {
    return res.status(400).json({
      message: "BookId must be a positive integer",
    });
  }

  try {
    const result = await connectionPool.query(
      `SELECT * 
      FROM books 
      WHERE book_id = $1 AND user_username = $2`,
      [bookId, username],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found or unauthorized",
      });
    }
    res.status(200).json({ book: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

bookRouter.post("/", async (req, res) => {
  const { title, author, genre, status } = req.body;
  const username = req.user?.username || req.user?.user_username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: ไม่พบข้อมูลผู้ใช้ใน Token" });
  }

  if (!title || !author || !genre) {
    return res.status(400).json({
      message: "กรุณากรอกข้อมูลหนังสือให้ครบถ้วน",
    });
  }

  try {
    const result = await connectionPool.query(
      `
            INSERT INTO books(
            user_username,
            title,
            author,
            genre,
            status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
      [username, title, author, genre, status || "Want to read"],
    );
    res.status(201).json({
      message: "Your Book is created",
      book: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

bookRouter.put("/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const username = req.user?.username || req.user?.user_username;
  const { title, author, genre, status } = req.body;

  if (isNaN(bookId) || bookId <= 0) {
    return res
      .status(400)
      .json({ message: "BookId must be a positive integer" });
  }

  if (!title || !author || !genre || !status) {
    return res
      .status(400)
      .json({ message: "กรุณากรอกข้อมูลหนังสือให้ครบถ้วน" });
  }

  try {
    const result = await connectionPool.query(
      `
      UPDATE books
      SET title = $1, author = $2, genre = $3, status = $4
      WHERE book_id = $5 AND user_username = $6
      RETURNING *
      `,
      [title, author, genre, status, bookId, username],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Book not found or unauthorized" });
    }

    res.status(200).json({
      message: "Book updated successfully",
      book: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

bookRouter.delete("/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const username = req.user?.username || req.user?.user_username;

  if (isNaN(bookId) || bookId <= 0) {
    return res
      .status(400)
      .json({ message: "BookId must be a positive integer" });
  }

  try {
    const result = await connectionPool.query(
      `DELETE FROM books 
      WHERE book_id = $1 AND user_username = $2 
      RETURNING *`,
      [bookId, username],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Book not found or unauthorized" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default bookRouter;
