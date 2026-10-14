import { api } from "./api";

export const fileService = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },
};
