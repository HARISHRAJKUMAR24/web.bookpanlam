"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputField, PluginFormProps } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import FormInputs from "../form-inputs";
import { useEffect, useState } from "react";
import {
  configurePlugin,
  getConfiguredPlugin,
} from "@/lib/api/configured-plugins";
import { handleToast } from "@/lib/utils";

interface Form {
  [key: string]: InputField;
}

const PluginForm = ({
  id,
  title,
  fieldLabel,
  fieldPlaceholder,
  children,
}: PluginFormProps) => {
  const [isDialogOpened, setIsDialogOpened] = useState(false);

  const [value, setValue] = useState("");
  const inputFields: Form = {
    name: {
      type: "text",
      value: value,
      setValue: setValue,
      label: fieldLabel,
      placeholder: fieldPlaceholder,
      required: true,
    },
  };

  useEffect(() => {
    async function getConfiguredPluginData() {
      try {
        const result = await getConfiguredPlugin(id);
        if (result) {
          setValue(result.value);
        }
      } catch (error) {}
    }

    id && getConfiguredPluginData();
  }, [id]);

  const handleSetUp = async () => {
    try {
      const result = await configurePlugin(id, value);

      handleToast(result);
      if (result.success) setIsDialogOpened(false);
    } catch (error) {}
  };

  return (
    <Dialog
      open={isDialogOpened}
      onOpenChange={() => {
        setIsDialogOpened((current) => !current);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[565px] px-0">
        <DialogHeader className="px-6">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="my-6 max-h-[66vh]">
          <div className="px-6 pb-1">
            <FormInputs inputFields={inputFields} />
          </div>
        </ScrollArea>

        <DialogFooter className="px-6">
          <Button type="button" onClick={handleSetUp}>
            Set up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PluginForm;
