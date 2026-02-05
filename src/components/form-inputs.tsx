import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { InputField } from "@/types";
import { Calendar } from "./ui/calendar";
import PhoneInput from "./ui/phone-input";
import FileDialog from "./file-upload/file-dialog";
import { Switch } from "./ui/switch";
import dynamic from "next/dynamic";

// ⭐ FIX: Import the CKEditor wrapper properly
const CkEditor = dynamic(
  () => import("@/components/CKEditorWrapper"),
  { ssr: false }
);
interface Props {
  inputFields: {
    [key: string]: InputField;
  };
}

const FormInputs = ({ inputFields }: Props) => {
  return (
    <div className="grid gap-6 grid-cols-12">
      {Object.keys(inputFields).map((input, index: number) => {
        const field = inputFields[input];

        return field.type === "select" ? (
          <div
            key={index}
            className={"col-span-12 " + field.containerClassName}
          >
            <Label className="mb-3 block">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={field.value as string}
              onValueChange={(value) => {
                field.setValue && field.setValue(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.inputFieldBottomArea}
          </div>
        ) : field.type === "textarea" ? (
          <div
            key={index}
            className={"col-span-12 " + field.containerClassName}
          >
            <Label className="mb-3 block">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              rows={field.rows}
              placeholder={field.placeholder}
              value={field.value as string}
              onChange={(e) => {
                field.setValue && field.setValue(e.target.value);
              }}
            />
            {field.inputFieldBottomArea}
          </div>
        ) : field.type === "checkbox" ? (
          <div
            key={index}
            className={
              "items-top flex space-x-3.5 col-span-12 " +
              field.containerClassName
            }
          >
            <Checkbox
              id={`checkbox:${index}`}
              className="w-5 h-5"
              onCheckedChange={(value) => {
                field.setValue && field.setValue(value as string);
              }}
              checked={field.value ? true : false}
            />
            <label
              htmlFor={`checkbox:${index}`}
              className="grid gap-1.5 leading-none"
            >
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {field.label}
              </p>

              <p className="text-sm text-muted-foreground">
                {field.labelDescription}
              </p>
            </label>
            {field.inputFieldBottomArea}
          </div>
        ) : field.type === "calendar" ? (
          <div
            key={index}
            className={"col-span-12 " + field.containerClassName}
          >
            <Label className="mb-3 block">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>

            <Calendar
              mode="single"
              selected={field.value as any}
              onSelect={field.setValue as any}
              className="rounded-md border max-w-[278px]"
            />
            {field.inputFieldBottomArea}
          </div>
        ) : field.type === "phone" ? (
          <div
            key={index}
            className={"col-span-12 " + field.containerClassName}
          >
            <Label className="mb-3 block">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <PhoneInput
              placeholder={field.placeholder}
              value={field.value}
              onChange={field.setValue}
              className="h-12 px-4 [&_input]:!text-base"
            />
            {field.inputFieldBottomArea}
          </div>
        ) : field.type === "file" ? (
          <div
            key={index}
            className={"col-span-12 " + field.containerClassName}
          >
            <Label className="mb-3 block">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <FileDialog files={field.value} setFiles={field.setValue} />
            {field.inputFieldBottomArea}
          </div>
        ) : field.type === "switch" ? (
          <div
            key={index}
            className={"col-span-12 " + field.containerClassName}
          >
            <div className="flex items-center justify-between gap-2">
              <Label className="mobile_l:w-[120px] w-[100px]">
                {field.label}
              </Label>
              <div className="flex items-center gap-5">
                <Switch
                  value={field.value as string}
                  onCheckedChange={(value) => {
                    field.setValue && field.setValue(value);
                  }}
                  checked={field.value as boolean}
                />
                <span className="text-sm font-medium leading-none text-black/50 mobile_l:block hidden w-[50px] text-right">
                  {field.value ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            {field.inputFieldBottomArea}
          </div>
        ) : field.type === "editor" ? (
          <div
            key={index}
            className={"col-span-12 " + field.containerClassName}
          >
            <Label className="mb-3 block">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <CkEditor
              data={field.value as string}
              onChange={field.setValue as any}
            />
            {field.inputFieldBottomArea}
          </div>
        ) : (
          <div
            key={index}
            className={"col-span-12 " + field.containerClassName}
          >
            <Label className="mb-3 block">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={field.value as string}
              onChange={(e) => {
                field.setValue && field.setValue(e.target.value);
              }}
              className={field.type === "time" ? "block" : ""}
            />
            {field.inputFieldBottomArea}
          </div>
        );
      })}
    </div>
  );
};

export default FormInputs;
