import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional for guest notes
    },
    isGuestNote: {
      type: Boolean,
      default: false
    },
    guestId: {
      type: String,
      required: false // For guest notes identification
    },
    tags: [{
      type: String,
      trim: true
    }],
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true } // createdAt, updatedAt
);

// Index for efficient queries
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ guestId: 1 });
noteSchema.index({ isArchived: 1 });

// Virtual for note summary
noteSchema.virtual('summary').get(function() {
  return this.content.length > 100 
    ? this.content.substring(0, 100) + '...' 
    : this.content;
});

// Method to check if note belongs to user
noteSchema.methods.belongsToUser = function(userId) {
  return this.user && this.user.toString() === userId.toString();
};

// Static method to find notes by user
noteSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId, isArchived: false }).sort({ createdAt: -1 });
};

// Static method to find guest notes
noteSchema.statics.findGuestNotes = function(guestId) {
  return this.find({ guestId, isGuestNote: true, isArchived: false }).sort({ createdAt: -1 });
};

// Pre-save middleware to set isGuestNote flag
noteSchema.pre('save', function(next) {
  if (!this.user && this.guestId) {
    this.isGuestNote = true;
  }
  next();
});

const Note = mongoose.model("Note", noteSchema);

export default Note;
