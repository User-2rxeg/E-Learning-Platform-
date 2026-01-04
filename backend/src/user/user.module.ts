import {forwardRef, Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {AuthModule} from "../auth/authentication-module";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {User, UserSchema} from "../database/user";


@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

        forwardRef(()=> AuthModule),
    ],

    controllers: [UserController],
    providers: [UserService],
    exports: [MongooseModule, UserService],
})
export class UserModule {}
