import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { State, StateSchema } from './state.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class StateModule {}
