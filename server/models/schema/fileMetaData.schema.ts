import { Schema } from 'mongoose';

const fileMetaDataSchema: Schema = new Schema({
  filename: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

export default fileMetaDataSchema;
