import express from "express"
import cookieParser from 'cookie-parser';
import userRouter from "./routes/employee.routes.js"
import expenseRoutes from "./routes/expense.routes.js";
import departmentRouter from "./routes/department.routes.js";
import cors from 'cors'


const app = express()

app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
res.send("server up and working")
})
app.use(cors({
    origin: ['http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization','token'],
    credentials: true
}));

app.use("/api/user",userRouter)
app.use("/api/expenses",expenseRoutes)
app.use("/api/departments",departmentRouter)


export default app

