When using LocalStorage for data persistence
- Rule 1: Schema Evolution Handling
  - When adding new fields (like `variantImages`) to `INITIAL_PRODUCTS`, existing data in LocalStorage will not automatically receive these fields.
  - You must implement a merge strategy in the data retrieval function (e.g., `getAll`) to backfill missing fields from `INITIAL_PRODUCTS` into the stored data.
  - Alternatively, version the storage key (e.g., `app_data_v2`) to force a fresh load, though this wipes user changes.