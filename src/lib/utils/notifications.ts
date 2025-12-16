export async function sendFoxentryFailedPaymentNotification(
  source = window.location.href
) {
  const endpoint = "https://hook.eu1.make.com/n688lk21pq7g9cu4dy39wuxycm61yvlw";

  const payload = {
    message: "Detected problem with Foxentry payment",
    source,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(
        "Failed to send Foxentry notification:",
        res.status,
        res.statusText
      );
    } else {
      console.log("Foxentry failed payment notification sent successfully");
    }
  } catch (err) {
    console.error("Error sending Foxentry notification:", err);
  }
}
