import { formatFileSize, getFileFromURL } from "@/lib/utils";
import { GalleryImport } from "iconsax-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FileUploader as ReactFileUploader } from "react-drag-drop-files";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { uploadFile } from "@/lib/api/files";
import { getCookie } from "cookies-next";
import { uploadsUrl } from "@/config";

const FileUploader = ({ ...props }) => {
  const [files, setFiles] = useState<any>(null);
  const [progress, setProgress] = useState<number[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [fileInfos, setFileInfos] = useState<any[]>([]);

  const [isUploadBtnDisabled, setIsUploadBtnDisabled] =
    useState<boolean>(false);

  // If default image
  useEffect(() => {
    if (!props.default) return;
    for (let index = 0; index < props.default.length; index++) {
      const url = `${uploadsUrl}/${props.default[index]}`;
      setImagePreviews((prev) => (!prev.includes(url) ? [...prev, url] : prev));
      setProgress((prev) =>
        !imagePreviews.includes(url) ? [...prev, 100] : prev
      );

      getFileFromURL(url)
        .then((blob) => {
          // Push data to the state
          setFileInfos((prev) => [
            ...prev,
            {
              name: url.substring(url.lastIndexOf("/") + 1),
              size: blob?.size,
            },
          ]);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [props.default]);

  // On files change
  const handleFileChange = (selectedFiles: any) => {
    if (selectedFiles) {
      setFiles(selectedFiles);
      setProgress(Array.from({ length: selectedFiles.length }, () => 0));

      const previews: string[] = [];
      const details: any[] = [];
      for (
        let i = 0;
        i < (selectedFiles?.name ? 1 : selectedFiles.length);
        i++
      ) {
        const file = selectedFiles?.name ? selectedFiles : selectedFiles[i];
        details.push({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });
        if (file.type.includes("image")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              previews[i] = e.target.result as string;
              setImagePreviews([...previews]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
      setFileInfos(details);
    }
    setIsUploadBtnDisabled(false);
  };

  // File Upload
  const handleFileUpload = async () => {
    const token = getCookie("token");

    if (token && files) {
      let data: string[] = [];

      for (let i = 0; i < (files?.name ? 1 : files.length); i++) {
        const formData = new FormData();
        formData.append("files", (files.name ? files : files[i]) as File);
        const response = await uploadFile(token, formData, setProgress);

        response.files.map((file: any) => {
          data.push(file.filename);
        });
      }

      props.setFiles(files.name ? data[0] : data);
      setIsUploadBtnDisabled(true);
    }
  };

  return (
    <>
      <ReactFileUploader handleChange={handleFileChange} name="file" {...props}>
        <div className="border border-dashed border-primary bg-primary/10 rounded-lg p-8 flex items-center justify-center flex-col gap-3.5">
          <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center">
            <GalleryImport />
          </div>

          <p className="font-medium text-center">
            Drag & Drop your images here or{" "}
            <span className="text-primary underline">browse files</span>
          </p>
        </div>
      </ReactFileUploader>

      {imagePreviews.map((preview, index) => (
        <>
          <div
            key={index}
            className="bg-gray-100 w-full p-4 rounded-lg flex items-center justify-between gap-12"
          >
            <div className="flex items-center gap-4 max-w-[200px] w-full break-all">
              <Image
                src={preview}
                alt=""
                width={40}
                height={40}
                className="rounded"
              />

              <div>
                <span className="block text-[15px]">
                  {fileInfos[index]?.name}
                </span>
                <span className="block text-[13px] text-gray-500">
                  {formatFileSize(fileInfos[index]?.size as number)}
                </span>
              </div>
            </div>

            <div className="w-[calc(100%_-_224px)]">
              <Progress value={progress[index]} className="bg-white w-full" />
            </div>
          </div>
        </>
      ))}

      {files && !isUploadBtnDisabled && (
        <Button
          onClick={handleFileUpload}
          className="ml-auto block"
          disabled={isUploadBtnDisabled}
        >
          Upload
        </Button>
      )}
    </>
  );
};

export default FileUploader;
