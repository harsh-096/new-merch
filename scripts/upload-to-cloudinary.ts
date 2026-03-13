import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface ImageMapping {
  file: string;
  folder: string;
}

const IMAGE_MAPPINGS: ImageMapping[] = [
  // Banner / Vinyl Banners
  { file: "BAN001A.webp", folder: "new-merch/Banner/Vinyl Banners" },
  { file: "BAN001B.webp", folder: "new-merch/Banner/Vinyl Banners" },
  { file: "BAN001C.webp", folder: "new-merch/Banner/Vinyl Banners" },

  // Business Card / Single Sided Business Cards
  { file: "BSC001A.webp", folder: "new-merch/Business Card/Single Sided Business Cards" },
  { file: "BSC001B.webp", folder: "new-merch/Business Card/Single Sided Business Cards" },

  // Flyer and Leaflets / Flyers
  { file: "FL001A.webp", folder: "new-merch/Flyer and Leaflets/Flyers" },
  { file: "FL001B.webp", folder: "new-merch/Flyer and Leaflets/Flyers" },

  // Exhibition Stand / Exhibition Stands
  { file: "EX001.png", folder: "new-merch/Exhibition Stand/Exhibition Stands" },

  // Roller Banner / Roller Banners
  { file: "RB001A.webp", folder: "new-merch/Roller Banner/Roller Banners" },
  { file: "RB001B.webp", folder: "new-merch/Roller Banner/Roller Banners" },
  { file: "RB001C.webp", folder: "new-merch/Roller Banner/Roller Banners" },
  { file: "RB001D.webp", folder: "new-merch/Roller Banner/Roller Banners" },
  { file: "RBN001.png", folder: "new-merch/Roller Banner/Roller Banners" },

  // Stationary / Pens
  { file: "PEN001A.webp", folder: "new-merch/Stationary/Pens" },
  { file: "PEN001B.webp", folder: "new-merch/Stationary/Pens" },
  { file: "PEN001C.webp", folder: "new-merch/Stationary/Pens" },
  { file: "PEN001D.webp", folder: "new-merch/Stationary/Pens" },
  { file: "PEN001E.webp", folder: "new-merch/Stationary/Pens" },
];

const IMGS_DIR = path.resolve(__dirname, "..", "imgs");

async function main() {
  console.log(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`Uploading ${IMAGE_MAPPINGS.length} images from ${IMGS_DIR}\n`);

  const results: { file: string; url: string; publicId: string }[] = [];

  for (const mapping of IMAGE_MAPPINGS) {
    const filePath = path.join(IMGS_DIR, mapping.file);

    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP: ${mapping.file} not found`);
      continue;
    }

    const publicId = `${mapping.folder}/${path.parse(mapping.file).name}`;

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      results.push({
        file: mapping.file,
        url: result.secure_url,
        publicId: result.public_id,
      });

      console.log(`  OK: ${mapping.file} → ${result.secure_url}`);
    } catch (err: any) {
      console.error(`  FAIL: ${mapping.file} → ${err.message}`);
    }
  }

  console.log(`\n${results.length}/${IMAGE_MAPPINGS.length} uploaded successfully.`);

  const outputPath = path.resolve(__dirname, "cloudinary-urls.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`URL mapping saved to ${outputPath}`);
}

main().catch(console.error);
