import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from '../database/entities/receipt.entity';
import { Order } from '../database/entities/order.entity';
import { Payment } from '../database/entities/payment.entity';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { CreateReceiptsDto } from './dto/create-receipts.dto';

@Injectable()
export class ReceiptsService {
	constructor(
		@InjectRepository(Receipt)
		private receiptsRepository: Repository<Receipt>,
		@InjectRepository(Order)
		private ordersRepository: Repository<Order>,
		@InjectRepository(Payment)
		private paymentsRepository: Repository<Payment>,
	) {}

	async generateReceipt(createReceiptsDto: CreateReceiptsDto) {
		const { orderId, paymentId } = createReceiptsDto;

		const order = await this.ordersRepository.findOne({
			where: { id: orderId },
			relations: ['orderItems', 'orderItems.product'],
		});

		if (!order) {
			throw new Error(`Order with ID ${orderId} not found`);
		}

		console.log('order:', order);

		const payment = await this.paymentsRepository.findOne({
			where: { id: paymentId },
		});

		if (!payment) {
			throw new Error(`Payment with ID ${paymentId} not found`);
		}

		const receipt = this.receiptsRepository.create({
			name: `Receipt for Order ${orderId}`,
			order: order,
			payment: payment,
			date: new Date(),
			totalAmount: order.total,
			warrantyInfo: order.orderItems.map((item) => ({
				product: item.product.name,
				warrantyPeriod: item.product.warranties
					? item.product.warranties
							.map((warranty) => warranty.period)
							.join(', ')
					: 'No warranty',
			})),
		});

		console.log({ receipt });

		const savedReceipt = await this.receiptsRepository.save(receipt);

		const pdfPath = path.join(
			__dirname,
			`../../../e_commerce/src/receipts/receipt-${savedReceipt.id}.pdf`,
		);
		await this.generatePdf(savedReceipt, pdfPath);

		return savedReceipt;
	}

	async viewReceipt(id: string) {
		return this.receiptsRepository.findOne({
			where: { id },
			relations: ['order', 'payment'],
		});
	}

	async downloadReceipt(id: string) {
		const receipt = await this.viewReceipt(id);
		if (!receipt) {
			throw new NotFoundException('Receipt not found');
		}

		const pdfPath = path.join(
			__dirname,
			`../../../e_commerce/src/receipts/receipt-${receipt.id}.pdf`,
		);
		return pdfPath;
	}

	async getAllReceipts() {
		return this.receiptsRepository.find({
			relations: ['order', 'payment'],
		});
	}

	private async generatePdf(receipt: Receipt, pdfPath: string) {
		const doc = new PDFDocument();
		doc.pipe(fs.createWriteStream(pdfPath));

		doc.fontSize(25).text('Receipt', { align: 'center' });
		doc.text(`Receipt ID: ${receipt.id}`);
		doc.text(`Order ID: ${receipt.order.id}`);
		doc.text(`Payment ID: ${receipt.payment.id}`);
		doc.text(`Date: ${receipt.date}`);
		doc.text(`Total Amount: ${receipt.totalAmount}`);

		doc.text('Items:');
		receipt.order.orderItems.forEach((item) => {
			doc.text(
				`- ${item.product.name}: ${item.quantity} x ${item.price}`,
			);
		});

		doc.text('Warranty Information:');
		receipt.warrantyInfo.forEach((info) => {
			doc.text(
				`- Product: ${info.product}, Warranty Period: ${info.warrantyPeriod} months`,
			);
		});

		doc.end();
	}
}
