// scripts/seed-admin.ts
import 'dotenv/config';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRole, UserSchema } from '../Database/User';

async function main() {
    const {
        MONGODB_URI,
        ADMIN_NAME = 'Platform Admin',
        ADMIN_EMAIL,
        ADMIN_PASSWORD,
        ADMIN_RESET_PASSWORD = 'false',
    } = process.env;

    if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in .env');
    if (!ADMIN_EMAIL) throw new Error('ADMIN_EMAIL is not set in .env');
    if (!ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is not set in .env');

    await mongoose.connect(MONGODB_URI);

    const UserModel = mongoose.model('User', UserSchema, 'users') as Model<any>;
    await UserModel.init(); // ensure indexes (e.g., unique email)

    const existing = await UserModel.findOne({ email: ADMIN_EMAIL }).exec();

    if (!existing) {
        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await UserModel.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashed,
            role: UserRole.ADMIN,
            isEmailVerified: true,
        });
        console.log(`Created admin: ${ADMIN_EMAIL}`);
    } else {
        const updates: Record<string, any> = {};
        if (existing.role !== UserRole.ADMIN) updates.role = UserRole.ADMIN;

        const shouldReset =
            typeof ADMIN_RESET_PASSWORD === 'string' &&
            ADMIN_RESET_PASSWORD.toLowerCase() === 'true';

        if (shouldReset) {
            updates.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
            console.log(' Admin password will be reset (ADMIN_RESET_PASSWORD=true).');
        }

        if (Object.keys(updates).length) {
            await UserModel.updateOne({ _id: existing._id }, { $set: updates }).exec();
            console.log(  `Updated admin: ${ADMIN_EMAIL}`);
        } else {
            console.log('Admin already exists and is up to date: ${ADMIN_EMAIL}');
        }
    }

    await mongoose.disconnect();
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(' Admin seed failed:', err);
        process.exit(1);
    });