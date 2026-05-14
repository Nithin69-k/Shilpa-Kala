# Security Specification: Shilpa-Kala

## 1. Data Invariants
- **Products**: Must belong to an authenticated artisan (`artisanId`).
- **Users**: Profiles are private and can only be managed by the owner.
- **Timestamps**: `createdAt` and `updatedAt` must be set by the server.
- **Types**: Price must be a number, names and descriptions must be strings with size limits.

## 2. The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Attempt to create a product with someone else's `artisanId`.
2. **Schema Poisoning**: Inject a 1MB string into the `name` field.
3. **Type Mismatch**: Attempt to set `price` as a boolean.
4. **Timestamp Hijacking**: Provide a client-side `createdAt` set to the future.
5. **Unauthorized Update**: Attempt to edit another artisan's product.
6. **Privilege Escalation**: Attempt to set a `role: "admin"` field on a user profile.
7. **PII Leak**: Attempt to read the entire `users` collection without being the owner of specific docs.
8. **Malicious ID**: Use an ID like `../../../system/hack` for a product.
9. **Shadow Field**: Add a `verified: true` field to a product payload that isn't in the schema.
10. **Immutable Field Change**: Attempt to change the `artisanId` of a product after creation.
11. **Negative Price**: Set `price: -100`.
12. **Orphaned Writes**: Create a product for a `userId` that doesn't exist in the system.

## 3. Test Runner Plan
I will generate `firestore.rules` that explicitly block these payloads using strict validation helpers and relational identity mapping.
