const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function generateInvoicePDF(order, res, reqHost) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            
            // Pipe output to response
            doc.pipe(res);

            // Invoice details
            const invoiceNumber = `INV-${new Date(order.createdAt).getFullYear()}-${order._id.toString().slice(-6).toUpperCase()}`;
            const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            
            const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
            const itemsSource = isNewFormat ? order.purchasedItems : order.products;

            // Generate QR Code
            const firstItemId = isNewFormat ? itemsSource[0]?.product?._id : itemsSource[0]?._id;
            const orderUrl = `${reqHost}/product/${firstItemId}`; 
            const qrData = `Invoice: ${invoiceNumber}\nOrder ID: ${order._id}\nPayment ID: ${order.paymentId || 'N/A'}\nTotal: Rs. ${order.totalAmount}\nURL: ${orderUrl}`;
            const qrBuffer = await QRCode.toBuffer(qrData, { width: 100, margin: 1 });

            // 1. Header (Logo & Company Info)
            doc.fillColor('#111827')
               .fontSize(24)
               .font('Helvetica-Bold')
               .text('ShopSphere', 50, 50);

            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#4b5563')
               .text('Premium Bag Collection', 50, 80)
               .text('support@shopsphere.com', 50, 95)
               .text('www.shopsphere.com', 50, 110);

            // Invoice Title & Info
            doc.fillColor('#111827')
               .fontSize(20)
               .font('Helvetica-Bold')
               .text('INVOICE', 400, 50, { align: 'right' });
            
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .text('Invoice Number:', 330, 80)
               .font('Helvetica')
               .text(invoiceNumber, 420, 80);
               
            doc.font('Helvetica-Bold')
               .text('Invoice Date:', 330, 95)
               .font('Helvetica')
               .text(invoiceDate, 420, 95);
               
            doc.font('Helvetica-Bold')
               .text('Order ID:', 330, 110)
               .font('Helvetica')
               .text(order._id.toString(), 420, 110);

            // Line Break
            doc.moveTo(50, 140).lineTo(545, 140).lineWidth(1).strokeColor('#e5e7eb').stroke();

            // 2. Customer & Seller Details
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text('Bill To:', 50, 160);
            doc.fontSize(10).font('Helvetica').fillColor('#4b5563')
               .text(order.user.fullname, 50, 180)
               .text(order.user.email, 50, 195);
               
            if (order.user.phone) {
                doc.text(order.user.phone, 50, 210);
            }

            // Extract Seller Info from the first product (Simplified for now)
            let sellerInfo = 'ShopSphere Official';
            let sellerContact = '';
            if (itemsSource.length > 0) {
                let seller;
                if (isNewFormat) {
                     // Check if seller was populated (sellerRouter does populate seller on product, but in purchasedItems it might be direct)
                     seller = itemsSource[0].seller;
                     if (itemsSource[0].product && itemsSource[0].product.seller && typeof seller !== 'object') {
                         seller = itemsSource[0].product.seller; 
                     }
                } else {
                     seller = itemsSource[0].seller;
                }
                
                if(seller) {
                    sellerInfo = seller.shopName || seller.fullname || 'Seller';
                    if(seller.email) sellerContact = seller.email;
                }
            }

            doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text('Sold By:', 300, 160);
            doc.fontSize(10).font('Helvetica').fillColor('#4b5563')
               .text(sellerInfo, 300, 180);
            if(sellerContact) {
                doc.text(sellerContact, 300, 195);
            }

            doc.moveTo(50, 240).lineTo(545, 240).lineWidth(1).strokeColor('#e5e7eb').stroke();

            // 3. Payment Details
            doc.fontSize(10)
               .font('Helvetica-Bold').text('Payment Method:', 50, 260)
               .font('Helvetica').text('Razorpay / Online', 150, 260)
               .font('Helvetica-Bold').text('Payment Status:', 300, 260)
               .font('Helvetica').text(order.status === 'Pending' ? 'Pending' : 'Paid', 400, 260);

            if (order.paymentId) {
                doc.font('Helvetica-Bold').text('Payment ID:', 50, 275)
                   .font('Helvetica').text(order.paymentId, 150, 275);
            }

            // 4. Products Table
            let y = 320;
            
            // Table Header
            doc.fillColor('#f3f4f6').rect(50, y, 495, 25).fill();
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10);
            doc.text('Product Name', 60, y + 8);
            doc.text('Category', 250, y + 8);
            doc.text('Qty', 350, y + 8, { width: 30, align: 'center' });
            doc.text('Unit Price', 400, y + 8, { width: 60, align: 'right' });
            doc.text('Final Price', 470, y + 8, { width: 65, align: 'right' });
            
            y += 35;
            doc.font('Helvetica').fillColor('#4b5563');

            // Count occurrences for quantities
            const productCounts = {};
            itemsSource.forEach(item => {
                if(!item) return;
                
                let pid, name, category, price, discount, qty;
                
                if (isNewFormat) {
                    if(!item.product) return;
                    pid = item.product._id.toString();
                    name = item.product.name || 'Product';
                    category = item.product.category || 'General';
                    price = item.price; // USE SNAPSHOT
                    discount = item.discount || 0; // USE SNAPSHOT
                    qty = item.qty || 1;
                } else {
                    pid = item._id.toString();
                    name = item.name || 'Product';
                    category = item.category || 'General';
                    price = item.price;
                    discount = item.discount || 0;
                    qty = 1;
                }

                if(productCounts[pid]) {
                    productCounts[pid].qty += qty;
                } else {
                    productCounts[pid] = { name, category, price, discount, qty };
                }
            });

            let subtotal = 0;
            let totalDiscount = 0;

            for (const pid in productCounts) {
                const item = productCounts[pid];
                
                doc.text(item.name.substring(0, 30) + (item.name.length > 30 ? '...' : ''), 60, y);
                doc.text(item.category, 250, y);
                doc.text(item.qty.toString(), 350, y, { width: 30, align: 'center' });
                
                const unitPrice = item.price;
                const unitDiscount = item.discount || 0;
                const finalUnitPrice = unitPrice - unitDiscount;
                const lineTotal = finalUnitPrice * item.qty;
                
                subtotal += (unitPrice * item.qty);
                totalDiscount += (unitDiscount * item.qty);

                doc.text('Rs. ' + unitPrice, 400, y, { width: 60, align: 'right' });
                doc.text('Rs. ' + lineTotal, 470, y, { width: 65, align: 'right' });

                y += 25;
                
                if (y > 650) {
                    doc.addPage();
                    y = 50;
                }
            }

            doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#e5e7eb').stroke();
            y += 20;

            // 5. Pricing Summary
            const gst = Math.round((subtotal - totalDiscount) * 0.18);
            const shipping = 20; // Default flat shipping fee
            const grandTotal = order.totalAmount; 

            doc.font('Helvetica-Bold').fillColor('#111827');
            doc.text('Subtotal:', 350, y, { width: 100, align: 'right' });
            doc.font('Helvetica').text('Rs. ' + subtotal, 450, y, { width: 85, align: 'right' });
            y += 20;

            doc.font('Helvetica-Bold');
            doc.text('Discount:', 350, y, { width: 100, align: 'right' });
            doc.font('Helvetica').text('- Rs. ' + totalDiscount, 450, y, { width: 85, align: 'right' });
            y += 20;

            doc.font('Helvetica-Bold');
            doc.text('Shipping:', 350, y, { width: 100, align: 'right' });
            doc.font('Helvetica').text('Rs. ' + shipping, 450, y, { width: 85, align: 'right' });
            y += 20;

            doc.font('Helvetica-Bold').fontSize(14).fillColor('#d4882e');
            doc.text('Grand Total:', 350, y, { width: 100, align: 'right' });
            doc.text('Rs. ' + grandTotal, 450, y, { width: 85, align: 'right' });

            // 6. QR Code
            doc.image(qrBuffer, 440, y + 40, { width: 90 });

            // 7. Footer
            const footerY = 750;
            doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).lineWidth(1).strokeColor('#e5e7eb').stroke();
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text('Thank you for shopping with ShopSphere!', 50, footerY, { align: 'center' });
            doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text('For support: support@shopsphere.com | www.shopsphere.com', 50, footerY + 15, { align: 'center' });

            doc.end();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateInvoicePDF };
