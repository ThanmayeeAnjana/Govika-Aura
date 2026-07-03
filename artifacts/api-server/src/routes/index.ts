import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import adminRouter from "./admin";
import productsRouter from "./products";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(adminRouter);
router.use(productsRouter);
router.use(ordersRouter);

export default router;
