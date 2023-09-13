import mongoose from "mongoose";

// Create a schema for the 'User' model, defining its structure and data types.
const userSchema = new mongoose.Schema({
    id: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: {type: String},
    bio: String,
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread"
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community"
        }
    ]
});

// Create a model named 'User' using the defined schema.
// If the 'User' model already exists (for example, in subsequent imports), use the existing model.
// If not, create a new 'User' model with the specified schema.
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;