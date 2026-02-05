import { Filter as FilterIcon } from "iconsax-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Filter = () => {
  const filters = ["Orders", "Amount"];

  return (
    <>
      <Popover>
        <PopoverTrigger className="w-full sm:w-auto">
          <div className="bg-gray-100 text-gray-500 rounded-full h-12 px-5 flex items-center justify-center gap-2">
            <FilterIcon variant="Bold" />
            Filter
          </div>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <div className="p-4">
            {filters.map((item, index: number, row) => (
              <div
                key={index}
                className={`space-y-3 ${
                  index + 1 !== row.length && "border-b mb-5 pb-5"
                }`}
              >
                <h5 className="font-medium">{item}</h5>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Condition</Label>
                    <Select value="equal_to">
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less_than">Less than</SelectItem>
                        <SelectItem value="greater_than">
                          Greater than
                        </SelectItem>
                        <SelectItem value="equal_to">Equal to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{item}</Label>
                    <Input type="number" placeholder="0" className="h-9" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-2 border-t mt-5">
            <Button variant="ghost" size="sm">
              Reset
            </Button>
            <Button size="sm">Apply</Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default Filter;
