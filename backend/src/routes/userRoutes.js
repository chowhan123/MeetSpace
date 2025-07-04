import express from 'express';
import { register, login , getUserHistory, addToHistory} from "../controllers/userController.js";
const router = express.Router();

router.get("/get-all-activity", getUserHistory);
router.post("/add-to-activity", addToHistory);
router.post("/register", register);
router.post("/login", login);


export default router;
