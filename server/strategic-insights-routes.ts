import { Router, Request, Response, NextFunction } from "express";
import { generateStrategicInsights } from "./services/strategic-insight-service";

const router = Router();

router.get("/strategic-insights", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await generateStrategicInsights();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
