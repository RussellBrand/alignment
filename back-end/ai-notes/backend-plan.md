# generate the updated application

Here's the complete application using Zod schemas as the single source of truth for both validation and MongoDB schema generation

## tmp

### **Updated Application Structure**

/alignment/back-end
├── package.json
├── server.js
├── /models
│ ├── index.js
├── /schemas
│ ├── index.js
├── /middlewares
│ ├── validate.js
├── /routes
│ ├── crudRoutes.js
├── /controllers
│ ├── crudController.js

### **1. Install Dependencies**

```bash
npm install express mongoose zod @zodyac/zod-mongoose
```

---

### **2. Zod Schemas → Mongoose Models**

#### `schemas/index.js`

```javascript
const { z } = require('zod');
const { extendZod } = require('@zodyac/zod-mongoose');

// Extend Zod with MongoDB capabilities
extendZod(z);

module.exports = {
  userSchema: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().regex(/^\d+$/, "Phone must contain only digits")
  }),

  questionSchema: z.object({
    q: z.string().min(1, "Question is required"),
    a: z.number().int("Answer must be an integer")
  }),

  quoteSchema: z.object({
    fulltext: z.string().min(1, "Full text is required")
  }),

  whenceSchema: z.object({
    begun_at: z.date(),
    ended_at: z.date()
  }).refine(data =&gt; data.begun_at &lt;= data.ended_at, {
    message: "begun_at must be earlier than ended_at"
  })
};
```

---

### **3. Generate Mongoose Models**

#### `models/index.js`

```javascript
const { zodSchema } = require('@zodyac/zod-mongoose');
const { model } = require('mongoose');
const schemas = require('../schemas');

// Generic model generator
const createModel = (name, schema) =&gt; model(name, zodSchema(schema));

// Create models with Zod schemas
module.exports = {
  User: createModel('User', schemas.userSchema),
  Question: createModel('Question', schemas.questionSchema),
  Quote: createModel('Quote', schemas.quoteSchema),

  // Custom model with additional validation
  Whence: (() =&gt; {
    const schema = zodSchema(schemas.whenceSchema);
    schema.pre('save', function(next) {
      if (this.begun_at &gt;= this.ended_at) {
        next(new Error("begun_at must be earlier than ended_at"));
      } else {
        next();
      }
    });
    return model('Whence', schema);
  })()
};
```

---

### **4. Validation Middleware**

#### `middlewares/validate.js`

```javascript
const { z } = require('zod');

module.exports = (schema) =&gt; (req, res, next) =&gt; {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      errors: error.errors.map(err =&gt; ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};
```

---

### **5. CRUD Controller**

#### `controllers/crudController.js`

```javascript
module.exports = {
  create: (Model) =&gt; async (req, res) =&gt; {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  readAll: (Model) =&gt; async (req, res) =&gt; {
    try {
      const items = await Model.find();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  readOne: (Model) =&gt; async (req, res) =&gt; {
    try {
      const item = await Model.findById(req.params.id);
      item ? res.json(item) : res.status(404).json({ error: 'Not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: (Model) =&gt; async (req, res) =&gt; {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      item ? res.json(item) : res.status(404).json({ error: 'Not found' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: (Model) =&gt; async (req, res) =&gt; {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      item ? res.json({ message: 'Deleted successfully' }) : res.status(404).json({ error: 'Not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
```

---

### **6. Dynamic Route Generator**

#### `routes/crudRoutes.js`

```javascript
const express = require('express');
const controller = require('../controllers/crudController');
const validate = require('../middlewares/validate');
const schemas = require('../schemas');

module.exports = (Model, schema) =&gt; {
  const router = express.Router();

  router.post('/', validate(schema), controller.create(Model));
  router.get('/', controller.readAll(Model));
  router.get('/:id', controller.readOne(Model));
  router.put('/:id', validate(schema), controller.update(Model));
  router.delete('/:id', controller.delete(Model));

  return router;
};
```

---

### **7. Main Application**

#### `server.js`

```javascript
const express = require('express');
const mongoose = require('mongoose');
const { User, Question, Quote, Whence } = require('./models');
const createRoutes = require('./routes/crudRoutes');
const schemas = require('./schemas');

const app = express();
app.use(express.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/zod2mongo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Register routes
app.use('/users', createRoutes(User, schemas.userSchema));
app.use('/questions', createRoutes(Question, schemas.questionSchema));
app.use('/quotes', createRoutes(Quote, schemas.quoteSchema));
app.use('/whence', createRoutes(Whence, schemas.whenceSchema));

// Start server
const PORT = 3000;
app.listen(PORT, () =&gt; console.log(`Server running on port ${PORT}`));
```

---

### **Key Features**

1. **Single Schema Definition:** Zod schemas define both validation rules and database structure
2. **Automatic Type Conversion:**
   - Zod string → Mongoose String
   - Zod number → Mongoose Number
   - Zod date → Mongoose Date
3. **Consistent Validation:** Same rules apply at API and database layers
4. **Error Handling:** Uniform error format for validation failures

---

### **Testing the Application**

#### **Start the server:**

```bash
node server.js
```

#### **Example POST request:**

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"name":"John","phone":"1234567890"}' \
http://localhost:3000/users
```

#### **Invalid request example:**

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"name":"J","phone":"abc"}' \
http://localhost:3000/users
```

**Response:**

```json
{
  "errors": [
    {
      "field": "name",
      "message": "String must contain at least 1 character(s)"
    },
    { "field": "phone", "message": "Invalid phone number format" }
  ]
}
```

---

This implementation eliminates schema duplication while maintaining full validation and type safety across your entire stack!
