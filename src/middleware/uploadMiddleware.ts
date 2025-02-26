import { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
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
      // Create uploads directory if not exists
      const uploadDir = path.join(__dirname, "../../public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      // Process image
      const processedImage = await sharp(req.file.buffer)
        .resize(800, 800, { fit: "inside" })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Save to local filesystem
      const filename = `${uuidv4()}.jpg`;
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, processedImage);

      // Save URL to request
      req.imageUrl = `/uploads/${filename}`;

      next();
    } catch (error) {
      console.error("Image processing error:", error);
      res.status(500).json({ error: "Image processing failed" });
    }
  },
];
