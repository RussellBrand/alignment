import mongoose, { Schema, Document, Model } from "mongoose";

// **********************************

export interface IUser extends Document {
  name: string;
  email: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

// **********************************

export interface IQuestion extends Document {
  text: string;
}

const QuestionSchema: Schema = new Schema({
  text: { type: String, required: true },
});

export const Question: Model<IQuestion> = mongoose.model<IQuestion>(
  "Question",
  QuestionSchema
);

// **********************************

export interface IQuote extends Document {
  text: string;
  author: string;
}

const QuoteSchema: Schema = new Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
});

export const Quote: Model<IQuote> = mongoose.model<IQuote>("Quote", QuoteSchema);

// **********************************

export interface IWhence extends Document {
  source: string;
}

const WhenceSchema: Schema = new Schema({
  source: { type: String, required: true },
});

export const Whence: Model<IWhence> = mongoose.model<IWhence>("Whence", WhenceSchema);

// **********************************
