import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingRequest extends Document {
    roomId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    checkInDate: Date;
    checkOutDate: Date;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    adminNote?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BookingRequestSchema = new Schema<IBookingRequest>(
    {
        roomId: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        checkInDate: {
            type: Date,
            required: true,
        },
        checkOutDate: {
            type: Date,
            required: true,
        },
        message: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminNote: {
            type: String,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
BookingRequestSchema.index({ userId: 1, status: 1 });
BookingRequestSchema.index({ roomId: 1 });
BookingRequestSchema.index({ status: 1 });

const BookingRequest =
    mongoose.models.BookingRequest ||
    mongoose.model<IBookingRequest>('BookingRequest', BookingRequestSchema);

export default BookingRequest;
