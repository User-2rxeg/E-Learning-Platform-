import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './User.Service';
import { UserController } from './User.Controller';
import { User, UserSchema } from '../Database/User';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService], // needed for AuthModule to use
})
export class UserModule {}