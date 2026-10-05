import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "VIVANA COIR <orders@vivanacoir.com>";
const REPLY_TO_EMAIL = "vivanacoir@gmail.com";

interface EmailItem {
  title: string;
  size?: string;
  quantity: number;
  price: number;
}

interface EmailPayload {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: EmailItem[];
  subtotal: number;
  shipping: number;
  total: number;
  type?: "inquiry" | "delivered";
}

export async function POST(req: NextRequest) {
  try {
    const body: EmailPayload = await req.json();
    const {
      orderId,
      customerName,
      email,
      phone,
      address,
      paymentMethod,
      items,
      subtotal,
      shipping,
      total,
      type,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    const itemsTableHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #d4edda; font-size: 14px; color: #333333;">
          <strong style="color: #1a5c2f;">${item.title}</strong>
          ${item.size ? `<br/><span style="font-size: 12px; color: #777777;">Size: ${item.size}</span>` : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #d4edda; font-size: 14px; color: #333333; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #d4edda; font-size: 14px; color: #333333; text-align: right;">
          Rs. ${item.price.toLocaleString("en-LK")}.00
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #d4edda; font-size: 14px; color: #333333; text-align: right;">
          Rs. ${(item.price * item.quantity).toLocaleString("en-LK")}.00
        </td>
      </tr>
    `
      )
      .join("");

    const isDelivery = type !== "inquiry";
    const bannerIcon = isDelivery ? "📦" : "📋";
    const bannerTitle = isDelivery ? "Your Order is Delivered!" : "Inquiry Received!";
    const bannerMessage = isDelivery
      ? `Dear <strong>${customerName}</strong>, we are delighted to inform you that your VIVANA COIR products have been successfully delivered to your doorstep.`
      : `Dear <strong>${customerName}</strong>, we have received your inquiry for our premium coir products. Our sales team will contact you shortly to confirm stock and arrange delivery.`;
    const totalLabel = isDelivery ? "Grand Total Paid:" : "Estimated Grand Total:";
    const subjectLine = isDelivery
      ? `Your VIVANA COIR Order ${orderId} has been Delivered! 📦`
      : `Your VIVANA COIR Inquiry ${orderId} is Received! 📋`;
    const plainText = isDelivery
      ? `Hello ${customerName}, your order ${orderId} has been successfully delivered to ${address}. Total amount: Rs. ${total.toLocaleString("en-LK")}.00. Thank you for choosing VIVANA COIR!`
      : `Hello ${customerName}, your inquiry ${orderId} has been successfully received. We will contact you shortly to confirm delivery to ${address}. Estimated total: Rs. ${total.toLocaleString("en-LK")}.00. Thank you for choosing VIVANA COIR!`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${bannerTitle}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f0f7f2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f7f2; padding: 20px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #d4edda; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(26, 92, 47, 0.08);">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="background-color: #1a5c2f; padding: 30px 20px; border-bottom: 3px solid #4caf50;">
                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; color: #ffffff; letter-spacing: 3px; text-transform: uppercase;">VIVANA HOLDINGS</h1>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #a5d6a7; text-transform: uppercase; letter-spacing: 2px;">Premium Coir Products Export – Sri Lanka</p>
                  </td>
                </tr>

                <!-- Status Banner -->
                <tr>
                  <td align="center" style="background-color: #f1f8f4; padding: 25px 20px; border-bottom: 1px solid #d4edda;">
                    <div style="display: inline-block; font-size: 24px; margin-bottom: 10px;">${bannerIcon}</div>
                    <h2 style="margin: 0; font-family: Georgia, serif; font-size: 20px; color: #2e7d32;">${bannerTitle}</h2>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #555555; line-height: 1.5; max-width: 480px;">
                      ${bannerMessage}
                    </p>
                  </td>
                </tr>

                <!-- Delivery Details -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 16px; color: #1a5c2f; border-bottom: 1px solid #d4edda; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Details</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.6; color: #555555;">
                      <tr>
                        <td width="35%" style="padding: 4px 0; font-weight: bold;">Order Reference:</td>
                        <td style="padding: 4px 0; color: #333333;"><strong>${orderId}</strong></td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: bold;">Contact Number:</td>
                        <td style="padding: 4px 0; color: #333333;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: bold; vertical-align: top;">Delivery Address:</td>
                        <td style="padding: 4px 0; color: #333333; line-height: 1.4;">${address}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: bold;">Payment Method:</td>
                        <td style="padding: 4px 0; color: #333333;">${paymentMethod}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Itemized Invoice Table -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 16px; color: #1a5c2f; border-bottom: 1px solid #d4edda; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Items Ordered</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #f1f8f4;">
                          <th align="left" style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #555555; border-bottom: 2px solid #d4edda;">Item</th>
                          <th align="center" style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #555555; border-bottom: 2px solid #d4edda; width: 60px;">Qty</th>
                          <th align="right" style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #555555; border-bottom: 2px solid #d4edda; width: 100px;">Price</th>
                          <th align="right" style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #555555; border-bottom: 2px solid #d4edda; width: 100px;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsTableHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Calculations -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" align="right" width="280" style="font-size: 14px; color: #555555;">
                      <tr>
                        <td style="padding: 5px 0;">Subtotal:</td>
                        <td align="right" style="padding: 5px 0; color: #333333;">Rs. ${subtotal.toLocaleString("en-LK")}.00</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; border-bottom: 1px solid #d4edda;">Shipping &amp; Handling:</td>
                        <td align="right" style="padding: 5px 0; border-bottom: 1px solid #d4edda; color: #333333;">
                          ${shipping === 0 ? '<span style="color: #2e7d32; font-weight: bold;">FREE</span>' : `Rs. ${shipping.toLocaleString("en-LK")}.00`}
                        </td>
                      </tr>
                      <tr style="font-size: 16px; font-weight: bold; color: #1a5c2f;">
                        <td style="padding: 10px 0;">${totalLabel}</td>
                        <td align="right" style="padding: 10px 0;">Rs. ${total.toLocaleString("en-LK")}.00</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Brand Message -->
                <tr>
                  <td style="background-color: #f1f8f4; padding: 25px 30px; border-top: 1px solid #d4edda; text-align: center;">
                    <h4 style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 14px; color: #1a5c2f; text-transform: uppercase; letter-spacing: 0.5px;">VIVANA COIR – Natural Products Statement</h4>
                    <p style="margin: 0; font-size: 12px; color: #777777; line-height: 1.5;">
                      Your purchase supports sustainable coir production from the heart of Sri Lanka's coconut triangle. Thank you for choosing eco-friendly natural products.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color: #1a5c2f; padding: 20px; font-size: 11px; color: #a5d6a7; border-top: 2px solid #4caf50;">
                    <p style="margin: 0;">© 2026 VIVANA COIR PRODUCTS EXPORT. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">Weheragalawaththa, Kahandawa, Ranna, Hambantota District, Sri Lanka | Email: vivanacoir@gmail.com</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO_EMAIL,
      subject: subjectLine,
      html: htmlContent,
      text: plainText,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    }

    console.log("Email sent successfully via Resend. ID:", data?.id);

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Email sending endpoint error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
