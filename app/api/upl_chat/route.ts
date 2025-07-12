import { type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const response = await fetch("http://127.0.0.1:8000/upl_chat", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(JSON.stringify({ error: `Backend error: ${errorText}` }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const pdfBuffer = await response.arrayBuffer()

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="enhanced-resume.pdf"',
      },
    })
  } catch (error) {
    console.error("API route error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
