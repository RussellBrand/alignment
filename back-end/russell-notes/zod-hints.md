# zod-mongoose hints

## chatgpt advice

​The `@zodyac/zod-mongoose` package enables you to generate Mongoose schemas directly from Zod schemas, streamlining the process of maintaining type safety and reducing redundancy in your codebase.

---

### 📦 Installation

You can install the package using your preferred package manager


````bash
npm install @zodyac/zod-mongoose
# or
yarn add @zodyac/zod-mongoose
# or
pnpm add @zodyac/zod-mongoose
# or
bun add @zodyac/zod-mongoose
```

---

### 🛠️ Usage

1. **Extend Zod** Before defining your schemas, extend Zod to include additional methods provided by `@zodyac/zod-mongoose.

   ```typescript
   import { z } from "zod";
   import { extendZod } from "@zodyac/zod-mongoose";

   extendZod(z);
   ``


2. **Define Zod Schema** Create your Zod schema as usual, utilizing the extended methods for fields like ObjectId and UUI.

   ```typescript
   const zUser = z.object({
     name: z.string().min(3).max(255),
     age: z.number().min(18).max(100),
     active: z.boolean().default(false),
     access: z.enum(["admin", "user"]).default("user"),
     companyId: zId("Company"),
     wearable: zUUID(),
     address: z.object({
       street: z.string(),
       city: z.string(),
       state: z.enum(["CA", "NY", "TX"]),
     }),
     tags: z.array(z.string()),
     createdAt: z.date(),
     updatedAt: z.date(),
   });
   ``


3. **Generate Mongoose Schema and Model** Convert the Zod schema to a Mongoose schema and create a mode.

   ```typescript
   import { zodSchema } from "@zodyac/zod-mongoose";
   import { model } from "mongoose";

   const schema = zodSchema(zUser);
   const UserModel = model("User", schema);
   ``


---

### 🔍 Features

- **Supported Types*: Basic types, nested objects, arrays, enums (strings only), default values, maps, dates, ObjectId, ObjectId references, ZodAny as SchemaTypes.Mixed, validation using refinement for String, Number, Date, and unique constraints for String, Number, Date, ObjectId, and UUD.

- **Partial Support*: Records are converted to Maps, and unions are not fully supported by Mongoose; the first inner type is usd.

- **Not Supported*: Intersections, sets, and indexes are not supported due to Mongoose or Zod limitatios.

---

### ⚠️ Notes

- **Extending Zod*: The `extendZod` function should be called once in your application to augment Zod with additional methods like `zId()` and `zUUID(`.

- **Unique Fields*: To enforce uniqueness on fields, use the `.unique()` method provided by the extended Zd.

   ```typescript
   const zUser = z.object({
     phone: z.string().unique(),
   });
   ``


- **Validation*: You can use Zod's `.refine()` method for custom validatios.

   ```typescript
   const zUser = z.object({
     phone: z.string().refine(
       (v) => /^\d{3}-\d{3}-\d{4}$/.test(v),
       "Invalid phone number"
     ),
   });
   ``


---

For more detailed information, refer to the [official documentation on npm](https://www.npmjs.com/package/@zodyac/zod-mongoose).
````
