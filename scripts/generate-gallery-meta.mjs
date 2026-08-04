/**
 * generate-gallery-meta.js
 *
 * Script tự động quét thư mục ảnh gallery, bóc tách EXIF (ngày chụp, GPS),
 * reverse geocoding tọa độ → tên địa danh, đọc kích thước ảnh,
 * sau đó sinh ra public/gallery-meta.json.
 *
 * Cài đặt dependencies:
 *   npm install sharp exifr node-fetch@2
 *
 * Chạy:
 *   node scripts/generate-gallery-meta.js
 */

import sharp from "sharp";
import exifr from "exifr";
import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

// ─────────────────────────────────────────────
//  Cấu hình
// ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

/** Thư mục chứa ảnh gallery (tương đối từ root dự án) */
const GALLERY_DIR = path.join(ROOT, "public", "gallery");

/** File JSON đầu ra */
const OUTPUT_FILE = path.join(ROOT, "public", "gallery-meta.json");

/** Đường dẫn src prefix dùng cho <Image /> của Next.js */
const SRC_PREFIX = "/gallery";

/** Danh sách đuôi ảnh được hỗ trợ */
const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff"];

/** Thời gian chờ (ms) giữa các request geocoding để tránh rate-limit */
const GEOCODE_DELAY_MS = 1200;

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/**
 * Tạo ID duy nhất từ tên file.
 * Ví dụ: "IMG_0398.jpg" → "img_IMG_0398"
 */
function makeId(filename) {
  const stem = path.basename(filename, path.extname(filename));
  // Làm sạch ký tự đặc biệt, chỉ giữ chữ/số/gạch nối
  const clean = stem.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `img_${clean}`;
}

/**
 * Format Date → "YYYY-MM-DD"
 */
function formatDate(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Đợi ms milliseconds (throttle geocoding API)
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Reverse geocoding: lat/lon → "City, Country"
 * Sử dụng Nominatim (OpenStreetMap) — hoàn toàn miễn phí, không cần API key.
 *
 * Lưu ý: Nominatim yêu cầu User-Agent và rate-limit 1 req/s.
 * Đây là API dùng cho môi trường local/dev, không production.
 */
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "portfolio-gallery-meta-generator/1.0 (local-dev)",
      },
    });

    if (!res.ok) {
      console.warn(`    ⚠ Geocoding HTTP ${res.status} cho (${lat}, ${lon})`);
      return null;
    }

    const data = await res.json();
    const addr = data.address || {};

    // Ưu tiên: city > town > village > county > state
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      null;
    const country = addr.country || null;

    if (!city && !country) return null;
    if (!city) return country;
    if (!country) return city;
    return `${city}, ${country}`;
  } catch (err) {
    console.warn(`    ⚠ Geocoding thất bại cho (${lat}, ${lon}): ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────
//  Logic chính
// ─────────────────────────────────────────────

async function processImage(filePath, index, total) {
  const filename = path.basename(filePath);
  console.log(`\n[${index + 1}/${total}] Đang xử lý: ${filename}`);

  const id = makeId(filename);
  const src = `${SRC_PREFIX}/${filename}`;

  // 1. Đọc kích thước ảnh bằng sharp
  let width = null;
  let height = null;
  try {
    const meta = await sharp(filePath).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
    console.log(`    ✓ Kích thước: ${width}×${height}`);
  } catch (err) {
    console.warn(`    ⚠ Không đọc được kích thước: ${err.message}`);
  }

  // 2. Đọc EXIF bằng exifr
  let date = null;
  let location = null;

  let camera = null;
  let iso = null;

  try {
    const exif = await exifr.parse(filePath, {
      pick: [
        "DateTimeOriginal", "CreateDate",
        "GPSLatitude", "GPSLongitude", "GPSLatitudeRef", "GPSLongitudeRef",
        "Make", "Model", "LensModel",
        "ISO", "ISOSpeedRatings",
      ],
    });

    if (exif) {
      // --- Ngày chụp ---
      const rawDate = exif.DateTimeOriginal || exif.CreateDate || null;
      date = formatDate(rawDate);
      if (date) {
        console.log(`    ✓ Ngày chụp: ${date}`);
      } else {
        console.log(`    ℹ Không có EXIF date → null`);
      }

      // --- GPS ---
      const lat = exif.latitude ?? exif.GPSLatitude ?? null;
      const lon = exif.longitude ?? exif.GPSLongitude ?? null;

      if (lat !== null && lon !== null) {
        console.log(`    ✓ GPS: (${lat.toFixed(5)}, ${lon.toFixed(5)}) — đang reverse geocoding...`);
        location = await reverseGeocode(lat, lon);
        if (location) {
          console.log(`    ✓ Địa danh: ${location}`);
        } else {
          console.log(`    ℹ Geocoding không trả về kết quả → null`);
        }
      } else {
        console.log(`    ℹ Không có GPS → null`);
      }

      // --- Thiết bị chụp ---
      const make = (exif.Make || "").trim();
      const model = (exif.Model || "").trim();
      const lens = (exif.LensModel || "").trim();

      // Tránh lặp lại tên hãng nếu model đã chứa hãng (vd: "SONY ILCE-7M4")
      let bodyStr = null;
      if (model) {
        const modelUpper = model.toUpperCase();
        const makeUpper = make.toUpperCase();
        bodyStr = (make && !modelUpper.startsWith(makeUpper)) ? `${make} ${model}` : model;
      } else if (make) {
        bodyStr = make;
      }

      if (bodyStr || lens) {
        const isAppleLens = lens && / back .+ camera /i.test(lens);
        if (isAppleLens) {
          camera = lens.replace(/ back .+? camera /i, " ").trim() || null;
        } else {
          camera = [bodyStr, lens].filter(Boolean).join(" + ") || null;
        }
        console.log(`    ✓ Thiết bị: ${camera}`);
      } else {
        console.log(`    ℹ Không có thông tin thiết bị → null`);
      }

      // --- ISO ---
      const isoRaw = exif.ISO ?? exif.ISOSpeedRatings ?? null;
      iso = typeof isoRaw === "number" ? isoRaw : (Array.isArray(isoRaw) ? isoRaw[0] ?? null : null);
      if (iso !== null) {
        console.log(`    ✓ ISO: ${iso}`);
      } else {
        console.log(`    ℹ Không có ISO → null`);
      }
    } else {
      console.log(`    ℹ Không có dữ liệu EXIF → date, location & camera = null`);
    }
  } catch (err) {
    console.warn(`    ⚠ Lỗi đọc EXIF: ${err.message}`);
  }

  return {
    id,
    src,
    date,
    location,
    camera,
    iso,
    width,
    height,
    caption: "",
  };
}

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║     Gallery Meta Generator — portfolio-new   ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // Kiểm tra thư mục gallery tồn tại
  if (!existsSync(GALLERY_DIR)) {
    console.error(`❌ Thư mục gallery không tồn tại: ${GALLERY_DIR}`);
    console.error(`   Hãy tạo thư mục và thêm ảnh vào trước khi chạy script.`);
    process.exit(1);
  }

  // Lấy danh sách file ảnh
  const allFiles = await fs.readdir(GALLERY_DIR);
  const imageFiles = allFiles
    .filter((f) => SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort(); // Sắp xếp A→Z để kết quả nhất quán

  if (imageFiles.length === 0) {
    console.warn("⚠ Không tìm thấy file ảnh nào trong thư mục gallery.");
    console.warn(`  Thư mục: ${GALLERY_DIR}`);
    process.exit(0);
  }

  console.log(`📂 Thư mục ảnh  : ${GALLERY_DIR}`);
  console.log(`📄 Output JSON  : ${OUTPUT_FILE}`);
  console.log(`🖼  Tìm thấy     : ${imageFiles.length} ảnh\n`);

  const results = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = path.join(GALLERY_DIR, imageFiles[i]);
    const entry = await processImage(filePath, i, imageFiles.length);
    results.push(entry);

    // Throttle: chờ giữa các ảnh nếu cần geocoding (tránh rate-limit Nominatim)
    if (i < imageFiles.length - 1) {
      await sleep(GEOCODE_DELAY_MS);
    }
  }

  // Ghi file JSON
  const jsonContent = JSON.stringify(results, null, 2);
  await fs.writeFile(OUTPUT_FILE, jsonContent, "utf-8");

  console.log("\n──────────────────────────────────────────────");
  console.log(`✅ Hoàn tất! Đã tạo ${results.length} mục trong:`);
  console.log(`   ${OUTPUT_FILE}`);

  // Tóm tắt
  const withDate = results.filter((r) => r.date !== null).length;
  const withLocation = results.filter((r) => r.location !== null).length;
  const withCamera = results.filter((r) => r.camera !== null).length;
  console.log(`\n📊 Thống kê:`);
  console.log(`   • Có ngày chụp (date)   : ${withDate}/${results.length}`);
  console.log(`   • Có địa danh (location) : ${withLocation}/${results.length}`);
  console.log(`   • Có thiết bị (camera)   : ${withCamera}/${results.length}`);
  console.log(`   • Cần nhập caption tay   : ${results.length} ảnh`);
  console.log("──────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("\n❌ Script thất bại với lỗi không mong muốn:");
  console.error(err);
  process.exit(1);
});
