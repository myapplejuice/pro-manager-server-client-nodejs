import { fileURLToPath } from 'url'
import path from 'path'

//DIRECTORY
export const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

/***************************************/
/***************************************/
/***************************************/
//MULTER (NOT USED IN THIS PROJ)
//const UPLOAD_DIR = path.resolve('uploads');
//if (!fs.existsSync(UPLOAD_DIR)) {
//    fs.mkdirSync(UPLOAD_DIR);
//}
//
//const STORAGE = multer.diskStorage({
//    destination: function (req, file, cb) {
//        cb(null, UPLOAD_DIR);
//    },
//    filename: function (req, file, cb) {
//        const FILE_NAME = file.originalname.replace(new RegExp(/\.[^/.]+$/), "");
//        const UNIQUE_SUFFIX = Date.now() + '-' + Math.round(Math.random() * 1E9);
//        const FILE_EXTENSION = file.originalname.split('.').pop()
//        cb(null, `${FILE_NAME}-${UNIQUE_SUFFIX}.${FILE_EXTENSION}`);
//    }
//})
//
//export const UPLOAD = multer({
//    storage: STORAGE, limits: {
//        fileSize: 50 * 1024 * 1024 // 10MB max per file
//    }
//})
/***************************************/
/***************************************/
/***************************************/