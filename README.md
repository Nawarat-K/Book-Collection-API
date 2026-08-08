Book Collection Management API

Features
1. User Authentication:สมัครสมาชิกและเข้าสู่ระบบ
2. Data:ผู้ใช้งานสามารถจัดการข้อมูลหนังสือได้เฉพาะหนังสือของตัวเองเท่านั้น
3. CRUD: ผู้ใช้งานสามารถจัดการหนังสือได้ดังนี้ Creat, Read, Update, Delete
4. Search & Filter: ผู้ใช้งานสามารถค้นหาหนังสือของตนเองได้จากชื่อหนังสือ (title),ชื่อผู้แต่ง (author) และกรองตามสถานะการอ่าน (Reading, Want to Read)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

API Endpoints Summary

Authentication
Method      Endpoint                Description
------------------------------------------------
POST        /api/auth/register      สมัครสมาชิกผู้ใช้ใหม่
POST        /api/auth/login         เข้าสู่ระบบและรับ JWT Toke

Book Collection Management
Method      Endpoint                Query Parameters            Description
----------------------------------------------------------------------------
GET         /api/books              status, search              แสดงรายการหนังสือทั้งหมด (รองรับ ค้นหา/กรอง)
GET         /api/books/:id          -                           แสดงรายละเอียดหนังสือตามเลข ID ที่ต้องการ
POST        /api/books              -                           เพิ่มหนังสือใหม่เข้าคอลเลกชัน
PUT         /api/books/:id          -                           แก้ไขข้อมูลหนังสือ
DELETE      /api/books/:id          -                           ลบหนังสือออกจากคอลเลกชัน

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Example Requests & Responses
1. Create Book (POST /api/books)
Request Body:

{
    "title": "Chamber of Secrets",
    "author": "J. K. Rowling",
    "genre": "Fantasy",
    "status": "Reading"
} 
or
{
    "title": "Prisoner of Azkaban",
    "author": "J. K. Rowling",
    "genre": "Fantasy",
}
//** status default is Want to read

Response (201 Created):
{
    "message": "Your Book is created",
    "book": {
        "book_id": 5,
        "user_username": "gib",
        "title": "Chamber of Secrets",
        "author": "J. K. Rowling",
        "genre": "Fantasy",
        "status": "Reading",
        "created_at": "2026-08-08T10:48:07.088Z"
    }
}

2. Search & Filter Books (GET /api/books?status=Want to read&search=Clean)
Response (200 OK):
{
    "message": "Get all books successfully",
    "data": [
        {
            "book_id": 3,
            "user_username": "gib",
            "title": "Philosopher's Stone",
            "author": "J. K. Rowling",
            "genre": "Fantasy",
            "status": "Want to read",
            "created_at": "2026-08-08T09:57:58.452Z"
        }
    ]
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Getting Started
1. Clone repository:
git clone <repository-url>

2. Install dependencies:
npm install

3. npm run dev