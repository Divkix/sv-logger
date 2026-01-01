import { describe, expect, it } from 'vitest';
import { projectCreatePayloadSchema } from './project';

describe('projectCreatePayloadSchema', () => {
  it('should accept valid project name', () => {
    const payload = {
      name: 'my-project',
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('my-project');
    }
  });

  it('should reject empty project name', () => {
    const payload = {
      name: '',
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject project name over 50 characters', () => {
    const payload = {
      name: 'a'.repeat(51),
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should accept project name with hyphens', () => {
    const payload = {
      name: 'my-awesome-project',
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('my-awesome-project');
    }
  });

  it('should accept project name with underscores', () => {
    const payload = {
      name: 'my_awesome_project',
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('my_awesome_project');
    }
  });

  it('should reject project name with special characters', () => {
    const payload = {
      name: 'my-project@123',
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject project name with spaces', () => {
    const payload = {
      name: 'my project',
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should accept single character project name', () => {
    const payload = {
      name: 'a',
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('a');
    }
  });

  it('should accept project name with exactly 50 characters', () => {
    const payload = {
      name: 'a'.repeat(50),
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toHaveLength(50);
    }
  });

  it('should accept alphanumeric project name', () => {
    const payload = {
      name: 'project123',
    };

    const result = projectCreatePayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('project123');
    }
  });
});
