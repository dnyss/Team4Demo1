import { useState, useCallback } from 'react';
import { validateField, validateForm } from '../utils/validators';

/**
 * Custom hook for form validation using Yup schemas
 * @param {Object} schema - Yup validation schema
 * @param {Object} initialValues - Initial form values
 * @returns {Object} - Form state and handlers
 */
const useFormValidation = (schema, initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle field blur - validate on blur
  const handleBlur = useCallback(async (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    // Validate this specific field
    const error = await validateField(schema, name, value);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [schema]);

  // Validate entire form
  const validate = useCallback(async () => {
    setIsValidating(true);
    const validationErrors = await validateForm(schema, values);
    setErrors(validationErrors);
    setIsValidating(false);
    return Object.keys(validationErrors).length === 0;
  }, [schema, values]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Set form values programmatically
  const setFormValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);

  // Set a single field value
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set field error manually
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    values,
    errors,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    validate,
    reset,
    setFormValues,
    setFieldValue,
    setFieldError,
    clearErrors
  };
};

export default useFormValidation;
