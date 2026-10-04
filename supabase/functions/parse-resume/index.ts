import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume_url } = await req.json();
    if (!resume_url || typeof resume_url !== "string") {
      return new Response(JSON.stringify({ error: "resume_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch the resume file
    const fileResp = await fetch(resume_url);
    if (!fileResp.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch resume file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileBuffer = await fileResp.arrayBuffer();
    const base64Content = btoa(
      new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Determine mime type
    const contentType = fileResp.headers.get("content-type") || "application/pdf";

    const systemPrompt = `You are a resume parser. You extract structured information from resumes.
You MUST respond by calling the extract_resume_data function with the extracted data.
Extract as much information as possible. For skills, list each skill individually.
For certifications, list each one. If a field is not found, use null.`;

    const userPrompt = `Parse the following resume and extract: full name, skills, education level, CGPA/GPA, college name, branch/major, graduation year, certifications, bio/summary, and any work experience (company + job title).

The resume is provided as a base64-encoded file. Analyze it thoroughly.

Base64 content (${contentType}): ${base64Content.substring(0, 50000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_resume_data",
              description: "Extract structured resume data",
              parameters: {
                type: "object",
                properties: {
                  full_name: { type: "string", description: "Full name of the person" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of skills",
                  },
                  education: { type: "string", description: "Education level e.g. B.Tech CSE" },
                  cgpa: { type: "number", description: "CGPA or GPA if mentioned" },
                  college: { type: "string", description: "College or university name" },
                  branch: { type: "string", description: "Branch or major" },
                  graduation_year: { type: "number", description: "Graduation year" },
                  certifications: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of certifications",
                  },
                  bio: { type: "string", description: "Professional summary or objective" },
                  company: { type: "string", description: "Most recent company" },
                  job_title: { type: "string", description: "Most recent job title" },
                },
                required: ["full_name", "skills"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_resume_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
