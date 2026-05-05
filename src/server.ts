import express, { Express } from 'express'
import cors from 'cors'
import { connectDB } from './config/db'
import { clerkMiddleware } from '@clerk/express'
import adminRouter from './routes/adminRouter'
import { checkAdminAccess } from './middlewares/authMiddleware'
import clientRoutes from './routes/clientRoutes';
import serviceRoutes from './routes/serviceRoutes';
import serviceRecordRoutes from './routes/serviceRecordRoutes';
import dashboardRoutes from './routes/dashboardRoutes';


if (process.env.NODE_ENV !== 'production') {
    process.loadEnvFile()
}

connectDB()

const app: Express = express()

app.use(cors())
app.use(express.json())

app.use(clerkMiddleware())

app.get('/api', (req, res) => {
    res.send('Hello World!')
})
app.use('/api/admin', checkAdminAccess, adminRouter)
app.use('/api/clientes', clientRoutes);
app.use('/api/servicios', serviceRoutes);
app.use('/api/registros', serviceRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app