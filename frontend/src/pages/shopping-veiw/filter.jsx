import { Label } from "@/components/ui/label";
import { filterOptions } from "@/config/config";
import { Fragment } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const Filter = ({ filters, handleFilter }) => {
  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <h3 className="font-bold text-base capitalize mb-2">{keyItem}</h3>
            <div className="grid gap-2">
              {filterOptions[keyItem].map((option) => (
                <Label
                  key={option.id}
                  className="flex items-center gap-2 font-normal"
                >
                  <Checkbox
                    checked={
                      filters[keyItem]?.includes(option.id) || false
                    }
                    onCheckedChange={() => handleFilter(keyItem, option.id)}
                  />
                  {option.label}
                </Label>
              ))}
            </div>
            <hr className="my-4 border-gray-300" />
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default Filter;
