"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Uploader from "./uploader";
import { File, FileDialogProps } from "@/types";
import { useEffect, useState } from "react";
import { getFiles } from "@/lib/api/files";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { uploadsUrl } from "@/config";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import {
  getFileExtension,
  limitStringWithEllipsis,
  removeFileExtension,
} from "@/lib/utils";

const fileTypes = ["JPG", "JPEG", "PNG", "WEBP", "GIF"];

const FileDialog = ({ multiple, files, setFiles }: FileDialogProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [data, setData] = useState<File[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getFilesData = async (page: number) => {
    setIsLoading(true);
    setData([]);
    const token = getCookie("token");
    try {
      const result = await getFiles(token as string, { limit: 20, page: page });
      setData(result.data.files);
      setTotalPages(result.data.totalPages);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFilesData(page);
  }, [page]);

  // On button click
  const handleSelect = () => {
    if (!setFiles) return;

    multiple
      ? setFiles((prev: string[]) => prev.concat(selectedFiles))
      : setFiles(selectedFiles[0]);
    setSelectedFiles([]);
    setIsOpened(false);
  };

  const handleNext = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    setPage((prev) => prev - 1);
  };

  return (
    <div>
      <Dialog open={isOpened} onOpenChange={setIsOpened}>
        <DialogTrigger className="w-full">
          <div className="border border-gray-300 text-gray-500 outline-none p-3 rounded w-full flex items-center gap-3">
            <ImageIcon size={38} />
            <div className="text-left">
              <span className="font-medium text-sm block">Upload Images</span>
              <small className="block mt-1 text-xs">
                Allowed file types: {fileTypes.join(", ")}
              </small>
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>Images</DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}

          <div className="border-y lg:flex gap-10">
            <div className="lg:w-[270px] py-3">
              <Uploader fileTypes={fileTypes} getFilesData={() => getFilesData(page)} />
            </div>

            <div className="lg:w-[calc(100%_-_270px)] border-l py-3 px-3 lg:max-h-[800px] max-h-[30vh] overflow-y-auto">
              <RadioGroup defaultValue={!multiple && files}>
                <div className="grid grid-cols-2 mobile_l:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {data.map((item, index) => (
                    <label
                      htmlFor={"imageInput:" + index}
                      key={index}
                      className="relative border border-transparent has-[:checked]:border-primary"
                      onDoubleClick={!multiple ? handleSelect : undefined}
                    >
                      <div className="absolute top-0.5 left-1">
                        {multiple ? (
                          <Checkbox
                            name="imageInput"
                            id={"imageInput:" + index}
                            className="peer"
                            onCheckedChange={(isChecked) => {
                              if (isChecked) {
                                setSelectedFiles((prev) => [
                                  ...prev,
                                  item.path,
                                ]);
                              } else {
                                setSelectedFiles((prevFiles) =>
                                  prevFiles.filter((f) => f !== item.path)
                                );
                              }
                            }}
                            defaultChecked={files && files.includes(item.path)}
                          />
                        ) : (
                          <RadioGroupItem
                            id={"imageInput:" + index}
                            value={item.path}
                            onClick={() => {
                              setSelectedFiles([item.path]);
                            }}
                          />
                        )}
                      </div>

                      <Image
                        src={uploadsUrl + "/" + item.path}
                        alt=""
                        width={140}
                        height={120}
                        className="w-full h-[120px] object-cover object-top"
                      />

                      <div className="text-xs bg-gray-100 text-center absolute bottom-0 left-0 w-full p-0.5 break-words">
                        {limitStringWithEllipsis(
                          removeFileExtension(item.name),
                          35
                        ) + getFileExtension(item.name)}
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between gap-5 w-full">
              <div className="flex gap-2">
                {totalPages > 1 && (
                  <>
                    <Button onClick={handlePrev} disabled={page <= 1}>
                      Prev
                    </Button>
                    <Button onClick={handleNext} disabled={page >= totalPages}>
                      Next
                    </Button>
                  </>
                )}
              </div>

              <Button
                onClick={handleSelect}
                disabled={selectedFiles.length < 1}
              >
                Select Files
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {files && (
        <div className="mt-1">
          <div className="flex flex-wrap gap-3">
            {multiple ? (
              files.map((file: string, index: number) => (
                <div key={index} className="relative">
                  <button
                    type="button"
                    className="bg-red-100 text-red-500 w-6 h-6 rounded-full flex items-center justify-center absolute top-0 right-0 rounded-r-none"
                    onClick={() => {
                      setFiles &&
                        setFiles((prevFiles: string[]) =>
                          prevFiles.filter((f) => f !== file)
                        );
                    }}
                  >
                    <X size={18} />
                  </button>

                  <Image
                    src={uploadsUrl + "/" + file}
                    alt=""
                    width={160}
                    height={100}
                    className="w-full h-[100px] object-cover object-top"
                  />
                </div>
              ))
            ) : (
              <div className="relative">
                <button
                  type="button"
                  className="bg-red-100 text-red-500 w-6 h-6 rounded-full flex items-center justify-center absolute top-0 right-0 rounded-r-none"
                  onClick={() => {
                    setFiles && setFiles("");
                  }}
                >
                  <X size={18} />
                </button>

                <Image
                  src={uploadsUrl + "/" + files}
                  alt=""
                  width={160}
                  height={100}
                  className="w-full h-[100px] object-cover object-top"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDialog;
