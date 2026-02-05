 /**
  * Maps database/API error messages to user-friendly messages
  * Prevents information leakage by hiding technical details
  */
 
 const ERROR_MAPPINGS: Record<string, string> = {
   // Auth errors
   "Invalid login credentials": "Invalid email or password. Please try again.",
   "Email not confirmed": "Please verify your email address before signing in.",
   "User already registered": "This email is already registered. Please sign in instead.",
   "Password should be at least 6 characters": "Password must be at least 6 characters long.",
   "Email rate limit exceeded": "Too many attempts. Please wait a few minutes before trying again.",
   "Signup is disabled": "Account registration is currently disabled.",
   
   // RLS/Permission errors
   "new row violates row-level security policy": "You don't have permission to perform this action.",
   "row-level security policy": "You don't have permission to perform this action.",
   
   // Validation errors (from our triggers)
   "Author name must be 100 characters or less": "Author name must be 100 characters or less.",
   "Comment must be 5000 characters or less": "Comment must be 5000 characters or less.",
   "Email must be 255 characters or less": "Email must be 255 characters or less.",
   "Please enter a valid email address": "Please enter a valid email address.",
   
   // Constraint errors
   "duplicate key value violates unique constraint": "This item already exists. Please use a different value.",
   "violates foreign key constraint": "This item is linked to other data and cannot be modified.",
   "violates check constraint": "The provided value is not valid.",
   
   // Network errors
   "Failed to fetch": "Unable to connect. Please check your internet connection.",
   "NetworkError": "Unable to connect. Please check your internet connection.",
   "TypeError: Failed to fetch": "Unable to connect. Please check your internet connection.",
 };
 
 /**
  * Converts technical error messages to user-friendly messages
  * @param error - The error from Supabase or other source
  * @param fallbackMessage - Optional fallback message (default: generic error)
  * @returns User-friendly error message
  */
 export function getSafeErrorMessage(
   error: Error | { message: string } | string | null | undefined,
   fallbackMessage: string = "Something went wrong. Please try again."
 ): string {
   if (!error) return fallbackMessage;
   
   const errorMessage = typeof error === "string" ? error : error.message;
   
   if (!errorMessage) return fallbackMessage;
   
   // Check for exact matches first
   if (ERROR_MAPPINGS[errorMessage]) {
     return ERROR_MAPPINGS[errorMessage];
   }
   
   // Check for partial matches (for errors with dynamic content)
   for (const [key, value] of Object.entries(ERROR_MAPPINGS)) {
     if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
       return value;
     }
   }
   
   // Log the original error for debugging (in development)
   if (import.meta.env.DEV) {
     console.error("Unhandled error:", errorMessage);
   }
   
   return fallbackMessage;
 }
 
 /**
  * For admin users, we can show more details since they're trusted
  * This still sanitizes the most sensitive technical details
  */
 export function getAdminErrorMessage(
   error: Error | { message: string } | string | null | undefined,
   fallbackMessage: string = "An error occurred."
 ): string {
   if (!error) return fallbackMessage;
   
   const errorMessage = typeof error === "string" ? error : error.message;
   
   if (!errorMessage) return fallbackMessage;
   
   // Still hide the most technical details even for admins
   const sensitivePatterns = [
     /column .+ does not exist/i,
     /relation .+ does not exist/i,
     /permission denied for/i,
     /syntax error at/i,
   ];
   
   for (const pattern of sensitivePatterns) {
     if (pattern.test(errorMessage)) {
       return "A database error occurred. Please contact support if this persists.";
     }
   }
   
   // For admins, check known mappings but allow through more descriptive messages
   if (ERROR_MAPPINGS[errorMessage]) {
     return ERROR_MAPPINGS[errorMessage];
   }
   
   // Return the original message for admins (with basic sanitization)
   return errorMessage.substring(0, 200);
 }