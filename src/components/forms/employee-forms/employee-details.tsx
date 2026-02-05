import { InputField, FormValueProps } from "@/types";
import FormInputs from "@/components/form-inputs";

interface Form {
  [key: string]: InputField;
}

const EmployeeDetails = ({
  name,
  position,
  phone,
  email,
  address,
  joining_date,   // ⭐ make sure this is here
}: FormValueProps) => {
  const inputFields: Form = {
    name: {
      type: "text",
      value: name.value,
      setValue: name.setValue,
      placeholder: "Enter name",
      label: "Name",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
    position: {
      type: "text",
      value: position.value,
      setValue: position.setValue,
      placeholder: "Enter position",
      label: "Job Position",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
    phone: {
      type: "phone",
      value: phone.value,
      setValue: phone.setValue,
      placeholder: "Enter phone number",
      label: "Phone Number",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
    email: {
      type: "text",
      value: email.value,
      setValue: email.setValue,
      placeholder: "Enter email address",
      label: "Email Address",
      containerClassName: "col-span-12 md:col-span-6",
    },
    address: {
      type: "text",
      value: address.value,
      setValue: address.setValue,
      placeholder: "Enter Address",
      label: "Address",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },

    // ⭐ Joining Date field added
    joining_date: {
      type: "date",
      value: joining_date.value,
      setValue: joining_date.setValue,
      label: "Joining Date",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Employee Details</h3>
        <p className="text-black/50 text-sm font-medium">
          Easily input essential details like employee name, employee code, and
          more to add a employee.
        </p>
      </div>

      <FormInputs inputFields={inputFields} />
    </div>
  );
};

export default EmployeeDetails;
