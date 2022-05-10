import { Router } from "express";
import AuthController from "../controllers/AuthController";

const authController = new AuthController();
const authRoutes = Router();

authRoutes.get("/sign-in", authController.signIn);

export default authRoutes;
