import cloudinary from "../config/cloudinary.js";

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
};