import { Request, Response, NextFunction, RequestHandler } from "express";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

interface CustomRequest extends Request {
  imageUrl?: string;
}

export const uploadImage = (fieldName: string): RequestHandler[] => [
  upload.single(fieldName),
  async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" }) as unknown as void;
      }
      const uploadDir = path.join(__dirname, "../../public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const processedImage = await sharp(req.file.buffer)
        .resize(800, 800, { fit: "inside" })
        .jpeg({ quality: 80 })
        .toBuffer();

      const filename = `${uuidv4()}.jpg`;
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, processedImage);

      req.imageUrl = `/uploads/${filename}`;

      next();
    } catch (error) {
      console.error("Image processing error:", error);
      res.status(500).json({ error: "Image processing failed" });
    }
  },
];
