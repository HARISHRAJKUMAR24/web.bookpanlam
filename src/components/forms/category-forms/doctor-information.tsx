"use client";

import FormInputs from "@/components/form-inputs";

interface SingleField {
  value: any;
  setValue: (value: any) => void;
}

interface DoctorInfoProps {
  doctorName: SingleField;
  specialization: SingleField;
  qualification: SingleField;
  experience: SingleField;
  regNumber: SingleField;
  uploadSlot?: React.ReactNode;
}

const DoctorInformation = ({
  doctorName,
  specialization,
  qualification,
  experience,
  regNumber,
  uploadSlot,
}: DoctorInfoProps) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 space-y-5 md:space-y-6">
      <h3 className="font-medium text-base sm:text-lg md:text-xl">
        Doctor Information
      </h3>

      {/* Row 1 - Responsive grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
        <div className="xs:col-span-2 sm:col-span-1 w-full">
          <FormInputs
            inputFields={{
              doctor_name: {
                type: "text",
                value: doctorName.value,
                setValue: doctorName.setValue,
                label: "Doctor Name",
                placeholder: "Enter doctor name",
                required: true,
              },
            }}
          />
        </div>

        <div className="xs:col-span-2 sm:col-span-1 w-full">
          <FormInputs
            inputFields={{
              qualification: {
                type: "text",
                value: qualification.value,
                setValue: qualification.setValue,
                label: "Qualification",
                placeholder: "Ex: MBBS, MD",
                required: true,
              },
            }}
          />
        </div>
      </div>

      {/* Row 2 - Responsive grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
        <div className="xs:col-span-2 sm:col-span-1 w-full">
          <FormInputs
            inputFields={{
              specialization: {
                type: "text",
                value: specialization.value,
                setValue: specialization.setValue,
                label: "Specialization",
                placeholder: "Ex: Dermatology",
                required: true,
              },
            }}
          />
        </div>

        <div className="xs:col-span-2 sm:col-span-1 w-full">
          <FormInputs
            inputFields={{
              experience: {
                type: "number",
                value: experience.value,
                setValue: experience.setValue,
                label: "Experience (Years)",
                placeholder: "Years of experience",
              },
            }}
          />
        </div>
      </div>

      {/* Reg Number - Full width on mobile */}
      <div className="w-full">
        <FormInputs
          inputFields={{
            reg_number: {
              type: "text",
              value: regNumber.value,
              setValue: regNumber.setValue,
              label: "Registration Number",
              placeholder: "Doctor registration number",
            },
          }}
        />
      </div>

      {uploadSlot && (
        <div className="mt-4 sm:mt-5 md:mt-6">{uploadSlot}</div>
      )}
    </div>
  );
};

export default DoctorInformation;