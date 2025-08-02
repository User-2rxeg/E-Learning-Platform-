import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../User/User.Module';
import { AuthModule } from '../Authentication/AuthModule';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // allows access to process.env globally
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const uri = configService.get<string>('MONGODB_URI');
                console.log('MONGO URI:', uri); // ✅ Test log
                return {
                    uri,
                };
            },
            inject: [ConfigService],
        }),
        UserModule,
        AuthModule,
    ],
})
export class AppModule {}
