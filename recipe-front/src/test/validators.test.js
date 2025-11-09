import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  recipeSchema,
  commentSchema,
  validateField,
  validateForm
} from '../utils/validators';

describe('Login Schema Validation', () => {
  it('should validate correct email and password', async () => {
    const data = { email: 'test@example.com', password: 'Password123' };
    const errors = await validateForm(loginSchema, data);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('should reject invalid email format', async () => {
    const data = { email: 'invalid-email', password: 'Password123' };
    const errors = await validateForm(loginSchema, data);
    expect(errors.email).toBeDefined();
  });

  it('should reject password shorter than 8 characters', async () => {
    const data = { email: 'test@example.com', password: 'Pass1' };
    const errors = await validateForm(loginSchema, data);
    expect(errors.password).toBeDefined();
  });

  it('should reject empty email', async () => {
    const data = { email: '', password: 'Password123' };
    const errors = await validateForm(loginSchema, data);
    expect(errors.email).toBeDefined();
  });
});

describe('Register Schema Validation', () => {
  it('should validate correct registration data', async () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      repeatPassword: 'Password123'
    };
    const errors = await validateForm(registerSchema, data);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('should reject username with special characters', async () => {
    const data = {
      username: 'test@user',
      email: 'test@example.com',
      password: 'Password123',
      repeatPassword: 'Password123'
    };
    const errors = await validateForm(registerSchema, data);
    expect(errors.username).toBeDefined();
  });

  it('should reject username shorter than 3 characters', async () => {
    const data = {
      username: 'ab',
      email: 'test@example.com',
      password: 'Password123',
      repeatPassword: 'Password123'
    };
    const errors = await validateForm(registerSchema, data);
    expect(errors.username).toBeDefined();
  });

  it('should reject password without uppercase letter', async () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123'
    };
    const errors = await validateForm(registerSchema, data);
    expect(errors.password).toBeDefined();
  });

  it('should reject password without number', async () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password',
      repeatPassword: 'Password'
    };
    const errors = await validateForm(registerSchema, data);
    expect(errors.password).toBeDefined();
  });

  it('should reject mismatched passwords', async () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      repeatPassword: 'Password456'
    };
    const errors = await validateForm(registerSchema, data);
    expect(errors.repeatPassword).toBeDefined();
  });
});

describe('Recipe Schema Validation', () => {
  it('should validate correct recipe data', async () => {
    const data = {
      title: 'Test Recipe',
      dish_type: 'dessert',
      ingredients: 'Flour, Sugar, Eggs',
      instructions: 'Mix all ingredients and bake at 350F for 30 minutes',
      preparation_time: 45,
      servings: 4,
      origin: 'Italian'
    };
    const errors = await validateForm(recipeSchema, data);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('should reject title shorter than 3 characters', async () => {
    const data = {
      title: 'Ab',
      dish_type: 'dessert',
      ingredients: 'Flour, Sugar',
      instructions: 'Mix and bake',
      preparation_time: 30
    };
    const errors = await validateForm(recipeSchema, data);
    expect(errors.title).toBeDefined();
  });

  it('should reject invalid dish type', async () => {
    const data = {
      title: 'Test Recipe',
      dish_type: 'invalid_type',
      ingredients: 'Flour, Sugar',
      instructions: 'Mix and bake for a while',
      preparation_time: 30
    };
    const errors = await validateForm(recipeSchema, data);
    expect(errors.dish_type).toBeDefined();
  });

  it('should reject ingredients shorter than 10 characters', async () => {
    const data = {
      title: 'Test Recipe',
      dish_type: 'dessert',
      ingredients: 'Flour',
      instructions: 'Mix and bake for a while',
      preparation_time: 30
    };
    const errors = await validateForm(recipeSchema, data);
    expect(errors.ingredients).toBeDefined();
  });

  it('should reject instructions shorter than 20 characters', async () => {
    const data = {
      title: 'Test Recipe',
      dish_type: 'dessert',
      ingredients: 'Flour, Sugar, Eggs',
      instructions: 'Mix and bake',
      preparation_time: 30
    };
    const errors = await validateForm(recipeSchema, data);
    expect(errors.instructions).toBeDefined();
  });

  it('should reject preparation time over 1440 minutes', async () => {
    const data = {
      title: 'Test Recipe',
      dish_type: 'dessert',
      ingredients: 'Flour, Sugar, Eggs',
      instructions: 'Mix and bake for a long time',
      preparation_time: 1500
    };
    const errors = await validateForm(recipeSchema, data);
    expect(errors.preparation_time).toBeDefined();
  });

  it('should reject servings over 100', async () => {
    const data = {
      title: 'Test Recipe',
      dish_type: 'dessert',
      ingredients: 'Flour, Sugar, Eggs',
      instructions: 'Mix and bake for a long time',
      preparation_time: 30,
      servings: 150
    };
    const errors = await validateForm(recipeSchema, data);
    expect(errors.servings).toBeDefined();
  });

  it('should accept empty servings and origin', async () => {
    const data = {
      title: 'Test Recipe',
      dish_type: 'dessert',
      ingredients: 'Flour, Sugar, Eggs',
      instructions: 'Mix and bake for a long time',
      preparation_time: 30,
      servings: '',
      origin: ''
    };
    const errors = await validateForm(recipeSchema, data);
    expect(Object.keys(errors).length).toBe(0);
  });
});

describe('Comment Schema Validation', () => {
  it('should validate correct comment', async () => {
    const data = { content: 'This is a great recipe!' };
    const errors = await validateForm(commentSchema, data);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('should reject empty comment', async () => {
    const data = { content: '' };
    const errors = await validateForm(commentSchema, data);
    expect(errors.content).toBeDefined();
  });

  it('should reject comment longer than 500 characters', async () => {
    const data = { content: 'a'.repeat(501) };
    const errors = await validateForm(commentSchema, data);
    expect(errors.content).toBeDefined();
  });

  it('should accept comment with exactly 500 characters', async () => {
    const data = { content: 'a'.repeat(500) };
    const errors = await validateForm(commentSchema, data);
    expect(Object.keys(errors).length).toBe(0);
  });
});

describe('validateField helper', () => {
  it('should validate a single field correctly', async () => {
    const error = await validateField(loginSchema, 'email', 'test@example.com');
    expect(error).toBeNull();
  });

  it('should return error for invalid field', async () => {
    const error = await validateField(loginSchema, 'email', 'invalid-email');
    expect(error).toBeDefined();
  });
});
