import React, { useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";

const Form = ({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
  middleContent,
}) => {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    const control = formControls.find((control) => control.name === name);
    if (!control?.validation) return true;

    const rules = control.validation;
    let isValid = true;
    let errorMessage = "";

    if (rules.required && !value.trim()) {
      isValid = false;
      errorMessage = "This field is required";
    } else if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage =
        rules.message || `Minimum ${rules.minLength} characters required`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      errorMessage =
        rules.message || `Maximum ${rules.maxLength} characters allowed`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      errorMessage = rules.message || "Invalid format";
    }

    setErrors((prev) => ({ ...prev, [name]: isValid ? null : errorMessage }));
    return isValid;
  };

  const validateForm = () => {
    let isValid = true;
    formControls.forEach((control) => {
      if (control.validation) {
        const fieldValid = validateField(
          control.name,
          formData[control.name] || ""
        );
        if (!fieldValid) isValid = false;
      }
    });
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formControls.find((control) => control.name === name)?.validation) {
      validateField(name, value);
    }
  };

  const handleBlur = (name, value) => {
    validateField(name, value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name || ""];
    const isPasswordField = getControlItem.type === "password";

    const commonProps = {
      name: getControlItem.name,
      placeholder: getControlItem.placeholder,
      id: getControlItem.name,
      value: value || "",
      onBlur: (e) => handleBlur(getControlItem.name, e.target.value),
      onChange: (e) => handleChange(getControlItem.name, e.target.value),
      className: errors[getControlItem.name] ? "border-red-500" : "",
    };

    switch (getControlItem.componentType) {
      case "input":
        element = (
          <div className="relative">
            <Input
              {...commonProps}
              type={
                isPasswordField && showPassword ? "text" : getControlItem.type
              }
            />
            {isPasswordField && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        );
        break;

      case "select":
        element = (
          <Select
            onValueChange={(value) => {
              handleChange(getControlItem.name, value);
              validateField(getControlItem.name, value);
            }}
            value={value}
          >
            <SelectTrigger
              className={`w-full ${
                errors[getControlItem.name] ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder={getControlItem.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;

      case "textarea":
        element = <Textarea {...commonProps} />;
        break;

      default:
        element = <Input {...commonProps} type={getControlItem.type} />;
        break;
    }

    return element;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1">
              {controlItem.label}
              {controlItem.validation?.required && (
                <span className="text-red-500"> *</span>
              )}
            </Label>
            {renderInputsByComponentType(controlItem)}
            {errors[controlItem.name] && (
              <p className="text-sm text-red-500">{errors[controlItem.name]}</p>
            )}
          </div>
        ))}
      </div>

      {middleContent && <div className="my-4">{middleContent}</div>}

      <Button disabled={isBtnDisabled} type="submit" className="mt-6 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
};

export default Form;
