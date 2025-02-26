import express, { Request, Response } from "express";
import { uploadImage } from "../middleware/uploadMiddleware";

interface CustomRequest extends Request {
  imageUrl?: string;
}

const router = express.Router();

router.post("/upload", uploadImage("avatar"), (req: CustomRequest, res: Response) => {
  res.json({
    message: "Image uploaded successfully",
    url: req.imageUrl,
  });
});

export default router;
