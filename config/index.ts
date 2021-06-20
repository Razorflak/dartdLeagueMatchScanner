import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  port: parseInt(process.env.PORT!, 10),

  pathTmpImg: process.env.PATH_TMP_IMG,

  pathTmpProcessPerspective: process.env.PATH_TMP_PROCESS_PERSPECTIVE,

  pathImageMagick: process.env.PATH_IMAGEMAGICK
};
