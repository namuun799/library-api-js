
import { Router } from "express";
import * as c from "../controllers/users.controller.js";

const router = Router();

router.post("/", c.create);

export default router;
