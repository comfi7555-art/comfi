/************************************************************************
 * COMFI Resend Email Utility
 * Integrates with Resend API using standard fetch.
 * Provides a development simulator fallback that prints beautiful styled 
 * console emails when RESEND_API_KEY is not configured in .env.local.
 ************************************************************************/

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM || "COMFI Care <onboarding@resend.dev>";

  // Development Fallback if Resend API Key is missing or default
  if (!apiKey || apiKey === "YOUR_RESEND_KEY" || apiKey.includes("YOUR_")) {
    console.log("\n========================================================");
    console.log(`⚡ [EMAIL SIMULATOR] Dispatching email to: ${to}`);
    console.log(`⚡ [EMAIL SIMULATOR] Subject: ${subject}`);
    console.log("--------------------------------------------------------");
    // Strip HTML tags for clean console layout and print first chunk
    const textPreview = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    console.log(textPreview.substring(0, 400) + "...");
    console.log("========================================================\n");
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, id: data.id };
    } else {
      const errText = await res.text();
      console.error("❌ [Resend API Error]:", errText);

      // Sandbox fallback if domain is unverified or email is restricted in free tier
      if (errText.includes("validation_error") || errText.includes("own email address") || errText.includes("testing emails")) {
        console.warn("\n⚠️ [RESEND SANDBOX WARNING]: Outgoing email restricted in Resend free tier.");
        console.warn("⚠️ Falling back to simulator mode. Check code/details below:");
        console.log("========================================================");
        console.log(`⚡ [EMAIL SIMULATOR] Dispatching email to: ${to}`);
        console.log(`⚡ [EMAIL SIMULATOR] Subject: ${subject}`);
        console.log("--------------------------------------------------------");
        const textPreview = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        console.log(textPreview.substring(0, 400) + "...");
        console.log("========================================================\n");
        return { success: true, simulated: true };
      }

      return { success: false, error: errText };
    }
  } catch (error) {
    console.error("❌ [Email Dispatch Failed]:", error);
    return { success: false, error: error.message };
  }
}
