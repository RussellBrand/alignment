import mongoose, { Schema, Document, Model } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const User: Model<IUser> = mongoose.model < IUser > ("User", UserSchema);

interface IQuestion extends Document {
  text: string;
}

const QuestionSchema: Schema = new Schema({
  text: { type: String, required: true },
});

const Question: Model<IQuestion> =
  mongoose.model < IQuestion > ("Question", QuestionSchema);

interface IQuote extends Document {
  text: string;
  author: string;
}

const QuoteSchema: Schema = new Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
});

const Quote: Model<IQuote> = mongoose.model < IQuote > ("Quote", QuoteSchema);

interface IWhence extends Document {
  source: string;
}

const WhenceSchema: Schema = new Schema({
  source: { type: String, required: true },
});

const Whence: Model<IWhence> =
  mongoose.model < IWhence > ("Whence", WhenceSchema);

export { User, Question, Quote, Whence };
