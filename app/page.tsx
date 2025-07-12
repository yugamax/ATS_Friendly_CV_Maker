"use client";

import { useState, useRef, useEffect } from "react"
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
import { Upload, Send, Download, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ParticleBackground from "@/components/particle-background"

export default function CVMaker() {
  const [step, setStep] = useState<"upload" | "prompt">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isMounted, setIsMounted] = useState(false);

  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedFile || selectedFile.type !== "application/pdf") {
      alert("Please upload a PDF file only.")
      return
    }

    setFile(selectedFile)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      console.log("Uploading file:", selectedFile.name, "Size:", selectedFile.size)

      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      })

      console.log("Upload response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Server error response:", errorData)
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }

      // Handle the response as a blob directly
      const blob = await response.blob()
      console.log("Received blob size:", blob.size, "type:", blob.type)

      // Ensure it's treated as PDF
      const pdfBlob = new Blob([blob], { type: "application/pdf" })
      setPdfBlob(pdfBlob)

      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
      setStep("prompt")
    } catch (error) {
      console.error("Error uploading file:", error)
      alert(`Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptSubmit = async () => {
    if (!file || !prompt.trim()) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("prompt", prompt)

      console.log("Submitting prompt:", prompt)

      const response = await fetch(`${BACKEND_URL}/upl_chat`, {
        method: "POST",
        body: formData,
      })

      console.log("Prompt response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Server error response:", errorData)
        throw new Error(errorData.error || `Prompt submission failed with status ${response.status}`)
      }

      // Handle the response as a blob directly
      const blob = await response.blob()
      console.log("Received blob size:", blob.size, "type:", blob.type)

      // Clean up previous blob
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      if (pdfBlob) setPdfBlob(null)

      // Ensure it's treated as PDF
      const newPdfBlob = new Blob([blob], { type: "application/pdf" })
      setPdfBlob(newPdfBlob)

      const url = URL.createObjectURL(newPdfBlob)
      setPdfUrl(url)
      setPrompt("")
    } catch (error) {
      console.error("Error submitting prompt:", error)
      alert(`Error processing your request: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (pdfBlob) {
      try {
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = "enhanced-resume.pdf"
        link.style.display = "none"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up the temporary URL
        setTimeout(() => URL.revokeObjectURL(url), 100)
      } catch (error) {
        console.error("Error downloading file:", error)
        alert("Error downloading file. Please try again.")
      }
    }
  }

  const handlePreview = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank")
    }
  }

  const resetToUpload = () => {
    setStep("upload")
    setFile(null)
    setPrompt("")
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
    if (pdfBlob) {
      setPdfBlob(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ParticleBackground />

      {/* Animated Logo */}
      <div className="relative z-10 pt-8 pb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              CV Maker
            </h1>
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-gray-400 text-lg font-light tracking-wider">
            by <span className="text-cyan-400 font-semibold">yugamax</span>
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-4 animate-pulse"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <div className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20">
          {step === "upload" && isMounted && (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Upload Your CV</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Upload your CV in PDF format to make it{" "}
                  <span className="text-cyan-400 font-semibold">ATS-friendly</span> and{" "}
                  <span className="text-purple-400 font-semibold">visually stunning!</span>
                </p>
              </div>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="group relative block w-full p-12 border-2 border-dashed border-cyan-500/50 rounded-xl cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/5 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <Upload className="w-16 h-16 text-cyan-400 mx-auto group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-cyan-400/20 animate-ping group-hover:animate-none"></div>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">Drop your PDF here or click to browse</p>
                      <p className="text-gray-400">Maximum file size: 10MB</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === "prompt" && (
            <div className="space-y-8 animate-slide-up">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold">CV Enhanced Successfully!</span>
                </div>

                {pdfBlob && (
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Enhanced CV
                    </Button>
                    <Button
                      onClick={handlePreview}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 py-3 px-6 rounded-xl transition-all duration-300 bg-transparent"
                    >
                      Preview PDF
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Want further changes? Tell us!</h3>
                  <p className="text-gray-400">Describe any additional formatting or changes you'd like in the content</p>
                </div>

                <div className="space-y-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Make it more descriptive, add more points to my experience smartly..."
                    className="min-h-32 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl resize-none"
                  />

                  <div className="flex gap-4">
                    <Button
                      onClick={handlePromptSubmit}
                      disabled={!prompt.trim() || isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {isLoading ? "Processing..." : "Apply Changes"}
                    </Button>

                    <Button
                      onClick={resetToUpload}
                      variant="outline"
                      className="px-6 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300 bg-transparent"
                    >
                      New CV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
                  <div
                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                  ></div>
                </div>
                <p className="text-white font-semibold text-lg">
                  {step === "upload" ? "Enhancing your CV..." : "Applying changes..."}
                </p>
                <p className="text-gray-400">This may take a few moments</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center mt-12 pb-8">
        <p className="text-gray-500 text-sm">Made by yugamax :3</p>
      </div>
    </div>
  )
}
