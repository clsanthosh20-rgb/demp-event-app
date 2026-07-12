import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import multer from 'multer';
import sharp from 'sharp';
import { firestore } from '../../lib/firestore.js';

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: { originalname: string; mimetype: string }, cb: multer.FileFilterCallback) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = file.originalname.toLowerCase().split('.').pop();
  if (ext && allowed.includes(`.${ext}`)) cb(null, true);
  else cb(new Error('Only PNG, JPG, JPEG, WEBP files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.post('/upload/image', authenticate, authorize('ADMIN'), (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const outputName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
      const processedBuffer = await sharp(req.file.buffer)
        .resize(1200, 630, { fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toBuffer();

      let url: string;
      try {
        const bucket: any = firestore.getBucket();
        const file = bucket.file(`uploads/${outputName}`);
        await file.save(processedBuffer, {
          metadata: { contentType: 'image/webp' },
        });
        await file.makePublic();
        url = `https://storage.googleapis.com/${bucket.name}/uploads/${outputName}`;
      } catch {
        url = `data:image/webp;base64,${processedBuffer.toString('base64')}`;
      }
      res.json({ url });
    } catch (e) {
      res.status(500).json({ error: 'Image processing failed' });
    }
  });
});

export { router as uploadRouter };
