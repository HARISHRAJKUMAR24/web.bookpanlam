import { uploadsUrl } from "@/config";
import { PluginCardProps } from "@/types";
import Image from "next/image";
import { Button } from "../ui/button";
import PluginForm from "../forms/plugin-form";

const PluginCard = ({
  id,
  name,
  description,
  icon,
  fieldLabel,
  fieldPlaceholder,
}: PluginCardProps) => {
  return (
    <PluginForm
      id={id}
      title={name}
      fieldLabel={fieldLabel}
      fieldPlaceholder={fieldPlaceholder}
    >
      <div className="bg-white border rounded-lg p-4 cursor-pointer transition hover:border-primary">
        <div className="flex justify-between items-center gap-5 mb-6">
          <Image
            src={uploadsUrl + "/" + icon}
            alt=""
            width={48}
            height={48}
            className="w-12 h-12 object-cover rounded-md"
          />

          <Button size="sm">Set up</Button>
        </div>

        <h3 className="font-bold text-xl mb-1.5">{name}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </PluginForm>
  );
};

export default PluginCard;
