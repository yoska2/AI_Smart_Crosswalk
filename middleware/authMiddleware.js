// מטרת פונקציית הביניים הזאת היא לבדוק האם המשתמש מחובר למערכת
// הפונקציה מקבלת את הטוקן שנשלח מהלקוח ובודקת האם הטוקן תקין
// ואם הכל תקין היא שומרת את פרטי המשתמש בתוך הבקשה


import jwt from "jsonwebtoken";



// פונקציית הביניים לבדיקת התחברות משתמש
const authMiddleware = (req, res, next) => {

    try {

        // קבלת המידע שנשלח בכותרת הבקשה
        const authHeader = req.headers.authorization;



        // בדיקה האם בכלל נשלח טוקן
        if (!authHeader) {

            return res.status(401).json({
                message: "אין טוקן גישה"
            });

        }



        // פיצול הטקסט לפי רווח
        // החלק הראשון הוא סוג ההתחברות
        // החלק השני הוא הטוקן עצמו
        const token = authHeader.split(" ")[1];



        // בדיקה האם באמת קיים טוקן
        if (!token) {

            return res.status(401).json({
                message: "טוקן לא תקין"
            });

        }



        // בדיקת תקינות הטוקן
        // המערכת בודקת
        // האם הטוקן אמיתי
        // האם לא שינו אותו
        // האם לא פג התוקף שלו
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );



        // שמירת פרטי המשתמש בתוך הבקשה
        req.user = decoded;



        // מעבר לשלב הבא בשרת
        next();

    } catch (error) {



        // אם הטוקן לא תקין
        return res.status(401).json({
            message: "טוקן לא תקין או שפג תוקפו"
        });

    }

};


// ייצוא פונקציית הביניים
export default authMiddleware;