import { Request, Response, NextFunction, RequestHandler } from "express";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import sharp from "sharp";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCP_SA_KEY || "{}"),
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || "");

const upload = multer({
  storage: multer.memoryStorage(),
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

      const processedImage = await sharp(req.file.buffer)
        .resize(800, 800, { fit: "inside" })
        .jpeg({ quality: 80 })
        .toBuffer();

      const filename = `uploads/${uuidv4()}-${Date.now()}.jpg`;
      const file = bucket.file(filename);
      await file.save(processedImage, {
        metadata: {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000",
        },
      });

      // Make public (if needed)
      // await file.makePublic();

      req.imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      next();
    } catch (error) {
      console.error("Image processing error:", error);
      res.status(500).json({ error: "Image processing failed" });
    }
  },
];
