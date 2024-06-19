import { Test, TestingModule } from '@nestjs/testing';
import { OrderitemsController } from './orderitems.controller';

describe('OrderitemsController', () => {
  let controller: OrderitemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderitemsController],
    }).compile();

    controller = module.get<OrderitemsController>(OrderitemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
