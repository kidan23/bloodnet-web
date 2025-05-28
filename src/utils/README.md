# Error Handling Utilities

This module provides utilities for handling API errors in a user-friendly way across the BloodNet application.

## Overview

The error handling system is designed to work with the backend's comprehensive error response structure, which returns errors in this format:

```typescript
interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  category: string;
  errors: ApiErrorDetail[];
  stack?: string;
}

interface ApiErrorDetail {
  message: string;
  field?: string;
  value?: any;
}
```

## Error Categories

The backend categorizes errors into different types:

- `VALIDATION_ERROR` - Input validation failures
- `AUTHENTICATION_ERROR` - Authentication issues
- `AUTHORIZATION_ERROR` - Permission/access issues
- `DATABASE_ERROR` / `MONGOOSE_ERROR` - Database-related errors
- `API_ERROR` - General API errors
- `UNKNOWN_ERROR` - Unexpected errors

## Usage

### Basic Error Message Extraction

```typescript
import { extractErrorMessage } from '../utils/errorHandling';

try {
  await someApiCall();
} catch (error) {
  const userFriendlyMessage = extractErrorMessage(error);
  console.error(userFriendlyMessage);
}
```

### Toast Notifications

```typescript
import { extractErrorForToast } from '../utils/errorHandling';

try {
  await someApiCall();
} catch (error) {
  const { summary, detail } = extractErrorForToast(error);
  toast.current?.show({
    severity: "error",
    summary,
    detail,
    life: 5000,
  });
}
```

### Error Type Checking

```typescript
import { isValidationError, isAuthenticationError } from '../utils/errorHandling';

try {
  await someApiCall();
} catch (error) {
  if (isValidationError(error)) {
    // Handle validation errors specifically
    console.log('Please check your input');
  } else if (isAuthenticationError(error)) {
    // Handle authentication errors
    console.log('Please log in again');
  }
}
```

## Examples

### Before (Generic Error)
```typescript
catch (error) {
  toast.current?.show({
    severity: "error",
    summary: "Error",
    detail: "Failed to approve application.",
    life: 3000,
  });
}
```

### After (Specific Error)
```typescript
catch (error) {
  const { summary, detail } = extractErrorForToast(error);
  toast.current?.show({
    severity: "error",
    summary, // "Validation Error"
    detail,   // "Failed to create user/entity for approved application: BloodBank validation failed: email: Path `email` is required."
    life: 5000,
  });
}
```

## Benefits

1. **User-Friendly Messages**: Instead of generic "Failed to..." messages, users see specific validation errors
2. **Better Debugging**: Error categories help identify the type of issue
3. **Consistent UX**: All error handling follows the same pattern across the app
4. **Longer Display Time**: Increased to 5 seconds for more complex error messages
5. **Fallback Handling**: Gracefully handles cases where structured errors aren't available

## Implementation

The error handling utilities have been implemented in the following pages:
- AdminApplicationsPage
- CreateBloodRequestDialog
- EditBloodRequestForm
- CreateDonationPage
- CreateDonorForm
- CreateMedicalInstitutionDialog
- EditMedicalInstitutionDialog

More pages can be updated to use this system by:
1. Importing `extractErrorForToast` from `../utils/errorHandling`
2. Replacing generic error handling with the utility function
3. Increasing toast life to 5000ms for better readability
