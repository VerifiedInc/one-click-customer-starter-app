import {
  fieldSchema,
  SSNSchema,
  getUnixSchema,
  stateSchema,
} from '@verifiedinc/shared-ui-elements/validations';
import * as z from 'zod';

export const signupFormSchema = z.object({
  firstName: fieldSchema,
  middleName: fieldSchema,
  lastName: fieldSchema,
  dob: getUnixSchema('Invalid Date of Birth'),
  ssn: SSNSchema,
  addressLine1: fieldSchema,
  addressLine2: fieldSchema,
  city: fieldSchema,
  state: stateSchema,
  zip: fieldSchema,
  country: fieldSchema,
});

export type SimpleSignupForm = z.infer<typeof signupFormSchema>;