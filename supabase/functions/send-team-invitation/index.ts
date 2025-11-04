import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { invitee_email, inviter_name, invite_token, role } = await req.json();

    if (!invitee_email || !invite_token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the origin from the request to build the invite URL
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/") || "http://localhost:5173";
    const inviteUrl = `${origin}/accept-invite?token=${invite_token}`;

    // If Resend API key is configured, send actual email
    if (RESEND_API_KEY) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Team Invitation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
                  <strong>${inviter_name || "A team member"}</strong> has invited you to join their team as a <strong>${role}</strong>.
                </p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
                    <strong>Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</strong><br>
                    ${role === 'admin' ? 'Full access to all features, can manage team members and settings' : role === 'editor' ? 'Can create, edit, and schedule posts' : 'Can view posts and analytics'}
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                  This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      const emailText = `
You're Invited to Join a Team!

${inviter_name || "A team member"} has invited you to join their team as a ${role}.

Role: ${role.charAt(0).toUpperCase() + role.slice(1)}
${role === 'admin' ? 'Full access to all features, can manage team members and settings' : role === 'editor' ? 'Can create, edit, and schedule posts' : 'Can view posts and analytics'}

Accept your invitation by clicking this link:
${inviteUrl}

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
      `;

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "PostSync Team <onboarding@resend.dev>",
          to: [invitee_email],
          subject: `You've been invited to join a team as ${role}`,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        console.error("Resend API error:", errorData);
        throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
      }

      const resendData = await resendResponse.json();
      console.log("Email sent successfully:", resendData);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Invitation email sent successfully",
          email_id: resendData.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // No email service configured - log the invitation details
      console.log("⚠️ RESEND_API_KEY not configured. Email not sent.");
      console.log("Invitation details:", {
        to: invitee_email,
        from: inviter_name,
        role: role,
        invite_url: inviteUrl,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Invitation created (email service not configured)",
          invite_url: inviteUrl,
          note: "RESEND_API_KEY environment variable not set. Configure it to send actual emails.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing invitation:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process invitation",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});