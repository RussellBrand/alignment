<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# generate complete application

Below is a complete Express application that incorporates Zod validation for the given types (`USER`, `QUESTION`, `QUOTE`, and `WHENCE`) and provides CRUD routes for each table.

---

### **Complete Application Code**

#### 1. **Install Dependencies**

Run the following command to install required dependencies:

```bash
npm install express mongoose zod body-parser
```

---

#### 2. **Folder Structure**

Organize your project as follows:

```
/project
├── /models
│   ├── User.js
│   ├── Question.js
│   ├── Quote.js
│   ├── Whence.js
├── /schemas
│   ├── userSchema.js
│   ├── questionSchema.js
│   ├── quoteSchema.js
│   ├── whenceSchema.js
├── /middlewares
│   ├── validate.js
├── /routes
│   ├── crudRoutes.js
├── server.js
```

---

#### 3. **Mongoose Models**

##### `/models/User.js`

```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);
```


##### `/models/Question.js`

```javascript
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    q: { type: String, required: true },
    a: { type: Number, required: true },
});

module.exports = mongoose.model('Question', QuestionSchema);
```


##### `/models/Quote.js`

```javascript
const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    fulltext: { type: String, required: true },
});

module.exports = mongoose.model('Quote', QuoteSchema);
```


##### `/models/Whence.js`

```javascript
const mongoose = require('mongoose');

const WhenceSchema = new mongoose.Schema({
    begun_at: { type: Date, required: true },
    ended_at: { type: Date, required: true },
});

module.exports = mongoose.model('Whence', WhenceSchema);
```

---

#### 4. **Zod Schemas**

##### `/schemas/userSchema.js`

```javascript
const { z } = require('zod');

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().regex(/^\d+$/, "Phone must contain only digits"),
});

module.exports = userSchema;
```


##### `/schemas/questionSchema.js`

```javascript
const { z } = require('zod');

const questionSchema = z.object({
    q: z.string().min(1, "Question is required"),
    a: z.number().int("Answer must be an integer"),
});

module.exports = questionSchema;
```


##### `/schemas/quoteSchema.js`

```javascript
const { z } = require('zod');

const quoteSchema = z.object({
    fulltext: z.string().min(1, "Full text is required"),
});

module.exports = quoteSchema;
```


##### `/schemas/whenceSchema.js`

```javascript
const { z } = require('zod');

const whenceSchema = z.object({
    begun_at: z.preprocess(
        (arg) =&gt; (typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg),
        z.date()
    ).refine((date) =&gt; !isNaN(date.getTime()), "Invalid begun_at date"),
    ended_at: z.preprocess(
        (arg) =&gt; (typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg),
        z.date()
    ).refine((date) =&gt; !isNaN(date.getTime()), "Invalid ended_at date"),
}).refine(
    (data) =&gt; data.begun_at &lt;= data.ended_at,
    { message: "begun_at must be earlier than or equal to ended_at", path: ["begun_at", "ended_at"] }
);

module.exports = whenceSchema;
```

---

#### 5. **Validation Middleware**

##### `/middlewares/validate.js`

```javascript
const validate = (schema) =&gt; (req, res, next) =&gt; {
    try {
        schema.parse(req.body); // Validate request body using Zod schema
        next(); // Proceed if validation passes
    } catch (error) {
        res.status(400).json({ errors: error.errors }); // Return validation errors as response
    }
};

module.exports = validate;
```

---

#### 6. **Route Generator**

##### `/routes/crudRoutes.js`

```javascript
const express = require('express');
const { create, readAll, readOne, update, remove } = require('../controllers/crudController');
const validate = require('../middlewares/validate');

const generateRoutes = (model, schema) =&gt; {
    const router = express.Router();

    router.post('/', validate(schema), create(model)); // Create route with validation middleware
    router.get('/', readAll(model)); // Get all items route
    router.get('/:id', readOne(model)); // Get single item route by ID
    router.put('/:id', validate(schema), update(model)); // Update route with validation middleware
    router.delete('/:id', remove(model)); // Delete route

    return router;
};

module.exports = generateRoutes;
```

---

#### 7. **CRUD Controller**

##### `/controllers/crudController.js`

```javascript
const create = (Model) =&gt; async (req, res) =&gt; {
    try {
        const item = new Model(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const readAll = (Model) =&gt; async (req, res) =&gt; {
    try {
        const items = await Model.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const readOne = (Model) =&gt; async (req, res) =&gt; {
    try {
        const item = await Model.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = (Model) =&gt; async (req, res) =&gt; {
    try {
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const remove = (Model) =&gt; async (req, res) =&gt; {
    try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { create, readAll, readOne, update, remove };
```

---

#### 8. **Main Server File**

##### `/server.js`

```javascript
const express = require('express');
const mongoose = require('mongoose');
const generateRoutes = require('./routes/crudRoutes');

// Import models and schemas
const User = require('./models/User');
const Question = require('./models/Question');
const Quote = require('./models/Quote');
const Whence = require('./models/Whence');

const userSchema = require('./schemas/userSchema');
const questionSchema = require('./schemas/questionSchema');
const quoteSchema = require('./schemas/quoteSchema');
const whenceSchema = require('./schemas/whenceSchema');

const app = express();
app.use(express.json());

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Register routes dynamically for each model and schema pair
app.use('/users', generateRoutes(User, userSchema));
app.use('/questions', generateRoutes(Question, questionSchema));
app.use('/quotes', generateRoutes(Quote, quoteSchema));
app.use('/whence', generateRoutes(Whence, whenceSchema));

// Start the server on port 3000
app.listen(3000, () =&gt; console.log('Server running on port 3000'));
```

---

### **Testing the Application**

1. Start the server:

```bash
node server.js
```

2. Use a tool like Postman or curl to test the CRUD endpoints:
    - POST `/users`, `/questions`, `/quotes`, `/whence` with valid payloads.
    - GET `/users`, `/questions`, `/quotes`, `/whence` to retrieve all records.
    - GET `/users/:id`, etc., to retrieve specific records.
    - PUT `/users/:id`, etc., to update records.
    - DELETE `/users/:id`, etc., to delete records.

This application is modular and scalable while ensuring robust validation with Zod!

