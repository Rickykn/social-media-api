const multer = require("multer");
const { nanoid } = require("nanoid")

const fileUploader = ({
  destinationFolder = "posts",
  prefix = "POST",
  fileType = "image"
}) => {
  // Handles how the file will be processed (destination and filename)
  const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${__dirname}/../public/${destinationFolder}`)
    },
    filename: (req, file, cb) => {
      const fileExtension = file.mimetype.split("/")[1]

      const filename = `${prefix}_${nanoid()}.${fileExtension}`

      cb(null, filename)
    }
  })

  const uploader = multer({
    storage: storageConfig,

    // Determines whether the file is allowed
    // to be uploaded or not
    fileFilter: (req, file, cb) => {

      console.log(file)
      // Check if file is image
      if (file.mimetype.split("/")[0] != fileType) {
        return cb(null, false)
      }

      cb(null, true)
    },
  })

  return uploader
}


module.exports = fileUploader