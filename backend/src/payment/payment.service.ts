import { Injectable } from '@nestjs/common';


@Injectable()
export class PaymentService {


  createInvoice (){
    
  } 

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }



  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
