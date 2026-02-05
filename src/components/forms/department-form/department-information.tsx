"use client";

import { InputField, DepartmentTypeFormProps } from "@/types";
import FormInputs from "@/components/form-inputs";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Form {
  [key: string]: InputField;
}

interface TypeField {
  id: number;
  index: number;
  nameKey: string;
  amountKey: string;
  hsnKey: string;
}

const DepartmentInformation = ({
  name,
  slug,
  typeMainName,
  typeMainAmount,
  typeMainHsn,
  type1Name,
  type1Amount,
  type1Hsn,
  type2Name,
  type2Amount,
  type2Hsn,
  type3Name,
  type3Amount,
  type3Hsn,
  type4Name,
  type4Amount,
  type4Hsn,
  type5Name,
  type5Amount,
  type5Hsn,
  type6Name,
  type6Amount,
  type6Hsn,
  type7Name,
  type7Amount,
  type7Hsn,
  type8Name,
  type8Amount,
  type8Hsn,
  type9Name,
  type9Amount,
  type9Hsn,
  type10Name,
  type10Amount,
  type10Hsn,
  type11Name,
  type11Amount,
  type11Hsn,
  type12Name,
  type12Amount,
  type12Hsn,
  type13Name,
  type13Amount,
  type13Hsn,
  type14Name,
  type14Amount,
  type14Hsn,
  type15Name,
  type15Amount,
  type15Hsn,
  type16Name,
  type16Amount,
  type16Hsn,
  type17Name,
  type17Amount,
  type17Hsn,
  type18Name,
  type18Amount,
  type18Hsn,
  type19Name,
  type19Amount,
  type19Hsn,
  type20Name,
  type20Amount,
  type20Hsn,
  type21Name,
  type21Amount,
  type21Hsn,
  type22Name,
  type22Amount,
  type22Hsn,
  type23Name,
  type23Amount,
  type23Hsn,
  type24Name,
  type24Amount,
  type24Hsn,
  type25Name,
  type25Amount,
  type25Hsn
}: DepartmentTypeFormProps) => {

  const [activeTypeFields, setActiveTypeFields] = useState<TypeField[]>([
    { id: 0, index: 0, nameKey: "typeMainName", amountKey: "typeMainAmount", hsnKey: "typeMainHsn" }
  ]);

  // Initialize additional type fields that have data
  useEffect(() => {
    const typeProps = [
      { index: 1, name: type1Name, amount: type1Amount, hsn: type1Hsn },
      { index: 2, name: type2Name, amount: type2Amount, hsn: type2Hsn },
      { index: 3, name: type3Name, amount: type3Amount, hsn: type3Hsn },
      { index: 4, name: type4Name, amount: type4Amount, hsn: type4Hsn },
      { index: 5, name: type5Name, amount: type5Amount, hsn: type5Hsn },
      { index: 6, name: type6Name, amount: type6Amount, hsn: type6Hsn },
      { index: 7, name: type7Name, amount: type7Amount, hsn: type7Hsn },
      { index: 8, name: type8Name, amount: type8Amount, hsn: type8Hsn },
      { index: 9, name: type9Name, amount: type9Amount, hsn: type9Hsn },
      { index: 10, name: type10Name, amount: type10Amount, hsn: type10Hsn },
      { index: 11, name: type11Name, amount: type11Amount, hsn: type11Hsn },
      { index: 12, name: type12Name, amount: type12Amount, hsn: type12Hsn },
      { index: 13, name: type13Name, amount: type13Amount, hsn: type13Hsn },
      { index: 14, name: type14Name, amount: type14Amount, hsn: type14Hsn },
      { index: 15, name: type15Name, amount: type15Amount, hsn: type15Hsn },
      { index: 16, name: type16Name, amount: type16Amount, hsn: type16Hsn },
      { index: 17, name: type17Name, amount: type17Amount, hsn: type17Hsn },
      { index: 18, name: type18Name, amount: type18Amount, hsn: type18Hsn },
      { index: 19, name: type19Name, amount: type19Amount, hsn: type19Hsn },
      { index: 20, name: type20Name, amount: type20Amount, hsn: type20Hsn },
      { index: 21, name: type21Name, amount: type21Amount, hsn: type21Hsn },
      { index: 22, name: type22Name, amount: type22Amount, hsn: type22Hsn },
      { index: 23, name: type23Name, amount: type23Amount, hsn: type23Hsn },
      { index: 24, name: type24Name, amount: type24Amount, hsn: type24Hsn },
      { index: 25, name: type25Name, amount: type25Amount, hsn: type25Hsn },
    ];

    const fieldsWithData: TypeField[] = [];

    typeProps.forEach((prop) => {
      if (prop.name?.value || prop.amount?.value || prop.hsn?.value) {
        fieldsWithData.push({
          id: prop.index,
          index: prop.index,
          nameKey: `type${prop.index}Name`,
          amountKey: `type${prop.index}Amount`,
          hsnKey: `type${prop.index}Hsn`,
        });
      }
    });

    setActiveTypeFields((prev) => {
      const existing = prev.map((f) => f.index);
      const newOnes = fieldsWithData.filter((f) => !existing.includes(f.index));
      return [...prev, ...newOnes].sort((a, b) => a.index - b.index);
    });
  }, [
    type1Name, type1Amount, type1Hsn,
    type2Name, type2Amount, type2Hsn,
    type3Name, type3Amount, type3Hsn,
    type4Name, type4Amount, type4Hsn,
    type5Name, type5Amount, type5Hsn,
  ]);

  const addTypeField = () => {
    const usedIndices = activeTypeFields.map(f => f.index);
    let nextIndex = 1;

    while (usedIndices.includes(nextIndex) && nextIndex <= 25) {
      nextIndex++;
    }

    if (nextIndex > 25) {
      alert("Maximum additional type fields reached (25)");
      return;
    }

    const newField: TypeField = {
      id: nextIndex,
      index: nextIndex,
      nameKey: `type${nextIndex}Name`,
      amountKey: `type${nextIndex}Amount`,
      hsnKey: `type${nextIndex}Hsn`
    };

    setActiveTypeFields(prev => [...prev, newField].sort((a, b) => a.index - b.index));
  };

  const removeTypeField = (index: number) => {
    if (index === 0) {
      // Clear main type values but don't remove
      typeMainName?.setValue("");
      typeMainAmount?.setValue("");
      typeMainHsn?.setValue("");
      return;
    }

    setActiveTypeFields(prev => prev.filter(field => field.index !== index));
    
    // Clear values for the removed field
    const setters: any = {
      1: { name: type1Name?.setValue, amount: type1Amount?.setValue, hsn: type1Hsn?.setValue },
      2: { name: type2Name?.setValue, amount: type2Amount?.setValue, hsn: type2Hsn?.setValue },
      3: { name: type3Name?.setValue, amount: type3Amount?.setValue, hsn: type3Hsn?.setValue },
      4: { name: type4Name?.setValue, amount: type4Amount?.setValue, hsn: type4Hsn?.setValue },
      5: { name: type5Name?.setValue, amount: type5Amount?.setValue, hsn: type5Hsn?.setValue },
      6: { name: type6Name?.setValue, amount: type6Amount?.setValue, hsn: type6Hsn?.setValue },
      7: { name: type7Name?.setValue, amount: type7Amount?.setValue, hsn: type7Hsn?.setValue },
      8: { name: type8Name?.setValue, amount: type8Amount?.setValue, hsn: type8Hsn?.setValue },
      9: { name: type9Name?.setValue, amount: type9Amount?.setValue, hsn: type9Hsn?.setValue },
      10: { name: type10Name?.setValue, amount: type10Amount?.setValue, hsn: type10Hsn?.setValue },
      11: { name: type11Name?.setValue, amount: type11Amount?.setValue, hsn: type11Hsn?.setValue },
      12: { name: type12Name?.setValue, amount: type12Amount?.setValue, hsn: type12Hsn?.setValue },
      13: { name: type13Name?.setValue, amount: type13Amount?.setValue, hsn: type13Hsn?.setValue },
      14: { name: type14Name?.setValue, amount: type14Amount?.setValue, hsn: type14Hsn?.setValue },
      15: { name: type15Name?.setValue, amount: type15Amount?.setValue, hsn: type15Hsn?.setValue },
      16: { name: type16Name?.setValue, amount: type16Amount?.setValue, hsn: type16Hsn?.setValue },
      17: { name: type17Name?.setValue, amount: type17Amount?.setValue, hsn: type17Hsn?.setValue },
      18: { name: type18Name?.setValue, amount: type18Amount?.setValue, hsn: type18Hsn?.setValue },
      19: { name: type19Name?.setValue, amount: type19Amount?.setValue, hsn: type19Hsn?.setValue },
      20: { name: type20Name?.setValue, amount: type20Amount?.setValue, hsn: type20Hsn?.setValue },
      21: { name: type21Name?.setValue, amount: type21Amount?.setValue, hsn: type21Hsn?.setValue },
      22: { name: type22Name?.setValue, amount: type22Amount?.setValue, hsn: type22Hsn?.setValue },
      23: { name: type23Name?.setValue, amount: type23Amount?.setValue, hsn: type23Hsn?.setValue },
      24: { name: type24Name?.setValue, amount: type24Amount?.setValue, hsn: type24Hsn?.setValue },
      25: { name: type25Name?.setValue, amount: type25Amount?.setValue, hsn: type25Hsn?.setValue }
    };

    if (setters[index]) {
      setters[index].name?.("");
      setters[index].amount?.("");
      setters[index].hsn?.("");
    }
  };

  // Helper to get field value and setter
  const getFieldProps = (index: number, fieldType: 'name' | 'amount' | 'hsn') => {
    let prop;

    if (index === 0) {
      prop = fieldType === "name" 
        ? typeMainName 
        : fieldType === "amount" 
          ? typeMainAmount 
          : typeMainHsn;
    } else {
      const props: any = {
        1: { name: type1Name, amount: type1Amount, hsn: type1Hsn },
        2: { name: type2Name, amount: type2Amount, hsn: type2Hsn },
        3: { name: type3Name, amount: type3Amount, hsn: type3Hsn },
        4: { name: type4Name, amount: type4Amount, hsn: type4Hsn },
        5: { name: type5Name, amount: type5Amount, hsn: type5Hsn },
        6: { name: type6Name, amount: type6Amount, hsn: type6Hsn },
        7: { name: type7Name, amount: type7Amount, hsn: type7Hsn },
        8: { name: type8Name, amount: type8Amount, hsn: type8Hsn },
        9: { name: type9Name, amount: type9Amount, hsn: type9Hsn },
        10: { name: type10Name, amount: type10Amount, hsn: type10Hsn },
        11: { name: type11Name, amount: type11Amount, hsn: type11Hsn },
        12: { name: type12Name, amount: type12Amount, hsn: type12Hsn },
        13: { name: type13Name, amount: type13Amount, hsn: type13Hsn },
        14: { name: type14Name, amount: type14Amount, hsn: type14Hsn },
        15: { name: type15Name, amount: type15Amount, hsn: type15Hsn },
        16: { name: type16Name, amount: type16Amount, hsn: type16Hsn },
        17: { name: type17Name, amount: type17Amount, hsn: type17Hsn },
        18: { name: type18Name, amount: type18Amount, hsn: type18Hsn },
        19: { name: type19Name, amount: type19Amount, hsn: type19Hsn },
        20: { name: type20Name, amount: type20Amount, hsn: type20Hsn },
        21: { name: type21Name, amount: type21Amount, hsn: type21Hsn },
        22: { name: type22Name, amount: type22Amount, hsn: type22Hsn },
        23: { name: type23Name, amount: type23Amount, hsn: type23Hsn },
        24: { name: type24Name, amount: type24Amount, hsn: type24Hsn },
        25: { name: type25Name, amount: type25Amount, hsn: type25Hsn },
      };

      prop = props[index]?.[fieldType];
    }

    return {
      value: prop?.value ?? "",
      setValue: (v: string) => {
        if (prop?.setValue) {
          prop.setValue(v);
        }
      }
    };
  };

  const inputFields: Form = {
    name: {
      type: "text",
      value: name?.value || "",
      setValue: name?.setValue || (() => { }),
      placeholder: "Enter department name",
      label: "Department Name",
      required: true,
    },
    slug: {
      type: "text",
      value: slug?.value || "",
      setValue: slug?.setValue || (() => { }),
      placeholder: "Enter department slug",
      label: "Department Slug (optional)",
    },
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Department Information</h3>
        <p className="text-black/50 text-sm font-medium">
          Easily input essential details like name, type and slug to showcase your department.
        </p>
      </div>

      <FormInputs inputFields={inputFields} />

      {/* Type Configuration Section */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Type Configuration</h4>
          <span className="text-sm text-gray-500">
            {activeTypeFields.filter(f => f.index > 0).length}/25 additional types
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Configure types with names, amounts, and HSN codes (optional). <strong>Main type is required.</strong> Add up to 25 additional types.
        </p>

        <div className="space-y-6">
          {/* All Type Fields */}
          {activeTypeFields.map((field) => {
            const nameProps = getFieldProps(field.index, 'name');
            const amountProps = getFieldProps(field.index, 'amount');
            const hsnProps = getFieldProps(field.index, 'hsn');

            return (
              <div
                key={field.id}
                className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg relative border ${field.index === 0
                    ? 'bg-blue-50 border-blue-100'
                    : 'bg-gray-50 border-gray-200'
                  }`}
              >
                {/* Delete button for additional types - TOP RIGHT CORNER */}
                {field.index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeTypeField(field.index)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors flex items-center justify-center shadow-md z-10"
                    title="Remove type"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {/* Type Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.index === 0 ? "Main Type Name" : `Type ${field.index} Name`}
                    {field.index === 0 && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={nameProps.value}
                    onChange={(e) => nameProps.setValue?.(e.target.value)}
                    placeholder={field.index === 0 ? "Enter main type name (required)" : `Enter type ${field.index} name`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.index === 0}
                  />
                </div>

                {/* Type Amount Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.index === 0 ? "Main Type Amount" : `Type ${field.index} Amount`}
                    {field.index === 0 && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountProps.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      amountProps.setValue(value);
                    }}
                    placeholder={field.index === 0 ? "Enter amount (required)" : "Enter amount"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.index === 0}
                  />
                </div>

                {/* HSN Code Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.index === 0 ? "Main Type HSN" : `Type ${field.index} HSN`}
                    <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={hsnProps.value}
                    onChange={(e) => hsnProps.setValue?.(e.target.value)}
                    placeholder="Enter HSN code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                  />
                </div>
              </div>
            );
          })}

          {/* Add Type Button */}
          {activeTypeFields.filter(f => f.index > 0).length < 25 && (
            <button
              type="button"
              onClick={addTypeField}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              <Plus size={20} />
              Add Additional Type Field
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentInformation;