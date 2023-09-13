import mongoose from "mongoose";

// Create a schema for the 'User' model, defining its structure and data types.
const threadSchema = new mongoose.Schema({
    text: {type: String, required: true},
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
    community: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Community",
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    parentId: {
        type: String
    },
    children: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Thread",
        }
    ]
});

// Create a model named 'User' using the defined schema.
// If the 'User' model already exists (for example, in subsequent imports), use the existing model.
// If not, create a new 'User' model with the specified schema.
const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;