import "react-phone-number-input/style.css";
import ReactPhoneInput from "react-phone-number-input";

const PhoneInput = ({ ...props }) => {
  return (
    <ReactPhoneInput
      {...props}
      defaultCountry="IN"
      onChange={props.onChange}
      className={
        "h-10 rounded-md border border-input bg-background px-3 py-2 [&_input]:text-sm [&_input]:h-full [&_input]:outline-none [&_input]:pl-1 " +
        props.className
      }
      limitMaxLength={true}
    />
  );
};

export default PhoneInput;
