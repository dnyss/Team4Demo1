import * as yup from 'yup';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Login form validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('El correo electrónico es obligatorio')
    .matches(emailRegex, 'Ingresa un correo electrónico válido')
    .trim(),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
});

// Register form validation schema
export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required('El nombre de usuario es obligatorio')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede exceder 20 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Solo se permiten letras, números y guiones bajos')
    .trim(),
  email: yup
    .string()
    .required('El correo electrónico es obligatorio')
    .matches(emailRegex, 'Ingresa un correo electrónico válido')
    .trim(),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/, 'La contraseña debe contener al menos un número'),
  repeatPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
});

// Recipe form validation schema (for both Create and Edit)
export const recipeSchema = yup.object().shape({
  title: yup
    .string()
    .required('El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .trim(),
  dish_type: yup
    .string()
    .required('El tipo de plato es obligatorio')
    .oneOf(
      ['appetizer', 'main course', 'dessert', 'snack', 'beverage', 'other'],
      'Selecciona un tipo de plato válido'
    ),
  ingredients: yup
    .string()
    .required('Los ingredientes son obligatorios')
    .min(10, 'Por favor proporciona más detalles sobre los ingredientes (al menos 10 caracteres)')
    .trim(),
  instructions: yup
    .string()
    .required('Las instrucciones son obligatorias')
    .min(20, 'Por favor proporciona instrucciones más detalladas (al menos 20 caracteres)')
    .trim(),
  preparation_time: yup
    .number()
    .required('El tiempo de preparación es obligatorio')
    .positive('El tiempo de preparación debe ser un número positivo')
    .integer('El tiempo de preparación debe ser un número entero')
    .max(1440, 'El tiempo de preparación no puede exceder 1440 minutos (24 horas)')
    .typeError('El tiempo de preparación debe ser un número'),
  servings: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .positive('Las porciones deben ser un número positivo')
    .integer('Las porciones deben ser un número entero')
    .max(100, 'Las porciones no pueden exceder 100')
    .typeError('Las porciones deben ser un número'),
  origin: yup
    .string()
    .max(100, 'El origen no puede exceder 100 caracteres')
    .trim()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
});

// Comment validation schema
export const commentSchema = yup.object().shape({
  content: yup
    .string()
    .required('El comentario no puede estar vacío')
    .min(1, 'El comentario debe tener al menos 1 caracter')
    .max(500, 'El comentario no puede exceder 500 caracteres')
    .trim()
});

// Helper function to validate a single field
export const validateField = async (schema, fieldName, value) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value });
    return null; // No error
  } catch (error) {
    return error.message;
  }
};

// Helper function to validate entire form
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return {}; // No errors
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
    }
    return errors;
  }
};
