import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppMessage = async ({
  customerName,
  orderId,
  paymentMethod,
  totalPrice,
  shippingAddress,
  orderItems
}) => {
  try {

    const itemsText = orderItems
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} - ₹${item.price}`
      )
      .join("\n");

    const message = `
🛒 NEW ORDER RECEIVED

👤 Customer: ${customerName}

🆔 Order ID:
${orderId}

📦 Items:
${itemsText}

💳 Payment:
${paymentMethod}

💰 Total:
₹${totalPrice}

📍 Address:
${shippingAddress.street},
${shippingAddress.city},
${shippingAddress.state},
${shippingAddress.zipCode},
${shippingAddress.country}
`;

    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: "whatsapp:+91YOUR_ADMIN_NUMBER",
      body: message
    });

    console.log("WhatsApp message sent");
  } catch (error) {
    console.log("WhatsApp Error:", error.message);
  }
};

export default sendWhatsAppMessage;