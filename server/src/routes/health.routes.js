import { Router } from "express"

const router = Router()

router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Secretary API is running"
    })
})

export default router