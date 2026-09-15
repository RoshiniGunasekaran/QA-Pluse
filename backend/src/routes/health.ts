import { Router, Request, Response } from "express";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy 🚀" });
});

router.get("/health", (req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
