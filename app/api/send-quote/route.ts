import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "VIVANA COIR <orders@vivanacoir.com>";
const REPLY_TO_EMAIL = "vivanacoir@gmail.com"; // Set to your inbox to receive replies

interface QuotePayload {
  name: string;
  email: string;
  phone: string;
  country: string;
  products: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: QuotePayload = await req.json();
    const { name, email, phone, country, products, message } = body;

    if (!name || !email || !products) {
      return NextResponse.json(
        { error: "Name, email, and products are required fields." },
        { status: 400 }
      );
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 4px solid #000B4D; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <h2 style="margin-top: 0; color: #000B4D; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">New Request for Quote</h2>
          
          <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td width="30%" style="font-weight: 600; color: #64748b;">Name:</td>
              <td style="color: #0f172a;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="font-weight: 600; color: #64748b;">Email:</td>
              <td style="color: #0f172a;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="font-weight: 600; color: #64748b;">Phone:</td>
              <td style="color: #0f172a;">${phone || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="font-weight: 600; color: #64748b;">Country:</td>
              <td style="color: #0f172a;">${country || "N/A"}</td>
            </tr>
          </table>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #000B4D; margin-bottom: 8px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">Products Requested:</h3>
            <div style="background: #f8fafc; padding: 15px; border-left: 3px solid #3B82F6; color: #334155; line-height: 1.6;">
              ${products.replace(/\n/g, '<br/>')}
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #000B4D; margin-bottom: 8px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">Additional Details:</h3>
            <div style="background: #f8fafc; padding: 15px; border-left: 3px solid #3B82F6; color: #334155; line-height: 1.6;">
              ${message ? message.replace(/\n/g, '<br/>') : "No additional details provided."}
            </div>
          </div>
          
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
            Sent from VIVANA HOLDINGS Website (Get a Quote Form)
          </p>

        </div>
      </body>
      </html>
    `;

    // Send the email to the shop admin
    const adminEmailRes = await resend.emails.send({
      from: FROM_EMAIL,
      to: [REPLY_TO_EMAIL], // Admin email
      replyTo: email,       // Reply directly to customer
      subject: `New Quote Request from ${name} 📋`,
      html: htmlContent,
    });

    if (adminEmailRes.error) {
      console.error("Resend API Error (Admin Email):", adminEmailRes.error);
      return NextResponse.json({ error: adminEmailRes.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to process quote request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
