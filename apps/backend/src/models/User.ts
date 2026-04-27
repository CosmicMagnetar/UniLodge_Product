import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'WARDEN' | 'GUEST';
  building?: string;
  organization?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'WARDEN', 'GUEST'],
    default: 'GUEST',
  },
  building: {
    type: String,
    required: false,
  },
  organization: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (this: any, next: any) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    // Auto-populate organization from email domain if not set
    if (!this.organization && this.email) {
      const domain = this.email.split('@')[1];
      if (domain) {
        const orgName = domain.split('.')[0];
        this.organization = orgName.charAt(0).toUpperCase() + orgName.slice(1);
      }
    }
    return;
  }

  try {
    // Ensure password is a string and not already hashed
    const passwordToHash = this.password.toString();

    // Use bcryptjs to hash with 10 salt rounds
    this.password = await bcrypt.hash(passwordToHash, 10);

    // Auto-populate organization from email domain if not set
    if (!this.organization && this.email) {
      const domain = this.email.split('@')[1];
      if (domain) {
        const orgName = domain.split('.')[0];
        this.organization = orgName.charAt(0).toUpperCase() + orgName.slice(1);
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export model - check if it already exists to avoid recompiling
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
