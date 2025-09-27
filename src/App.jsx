import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Upload, Mail, Menu, Copy, Send, Loader2, CheckCircle } from 'lucide-react'
import './App.css'
import { Toaster, toast } from 'sonner'

function App() {
  const [activeTab, setActiveTab] = useState('submission')
  const [emailText, setEmailText] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [inputMethod, setInputMethod] = useState('text') // 'text' ou 'file'
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  function buildSubject(classification, original) {
    // Heurística simples só pra ter um assunto "ok"
    if (classification === 'Produtivo') return 'Retorno AutoU Invest — seu atendimento'
    if (classification === 'Improdutivo') return 'Agradecimento — AutoU Invest'
    // fallback: usa trecho do original
    const base = (original || '').replace(/\s+/g, ' ').slice(0, 60)
    return base ? `Re: ${base}` : 'Retorno — AutoU Invest'
  }

  const callApi = async () => {
    setIsLoading(true)
    try {
      const fd = new FormData()
      if (inputMethod === 'text') {
        fd.append('conteudo', emailText)
      } else if (uploadedFile) {
        fd.append('file', uploadedFile)
      }

      const res = await fetch(`${API_URL}/emails/ai`, {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || `Erro ${res.status}`)
      }

      // A API retorna: { id, conteudo, classificacao, resposta, created_at, ... }
      const data = await res.json()

      const mapped = {
        subject: data.assunto || buildSubject(data.classificacao, data.conteudo),
        body: data.resposta,
        classification: data.classificacao,
        originalContent: inputMethod === 'text' ? emailText : uploadedFile?.name || '',
        id: data.id,
        createdAt: data.created_at,
      }

      setResult(mapped)
      setActiveTab('result')
      toast("E-mail processado com sucesso!", {
        duration: 2500,
        icon: <CheckCircle className="text-green-500" />,
      })
    } catch (e) {
      console.error(e)
      toast(e.message || "Falha ao processar com IA", {
        duration: 3000,
        icon: <XCircle className="text-red-500" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if ((inputMethod === 'text' && emailText.trim()) || (inputMethod === 'file' && uploadedFile)) {
      callApi()
    }
  }

  const copyToClipboard = () => {
    if (result) {
      const content = `Assunto: ${result.subject}\n\n${result.body}`
      navigator.clipboard.writeText(content)
      toast("Conteúdo copiado para a área de transferência!", {
        duration: 2500,
        icon: <CheckCircle className="text-green-500" />,
      })
    }
  }

  const sendEmail = () => {
    if (result) {
      const subject = encodeURIComponent(result.subject)
      const body = encodeURIComponent(result.body)
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">SmartMail AutoU</h1>
          </div>
          
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Automatização de E-mails</CardTitle>
                <CardDescription>
                  Otimize a rotina: a IA lê, classifica e responde seus e-mails em segundos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <img
                      src="/src/assets/new_logo.png"
                      alt="Logo"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>• Ganho de eficiência</p>
                  <p>• Classificação de e-mails</p>
                  <p>• Geração de respostas automatizadas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 ">
                <TabsTrigger 
                  value="submission" 
                  disabled={isLoading}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Submissão</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="result"
                  disabled={!result && !isLoading}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Resultado</span>
                </TabsTrigger>
              </TabsList>

              {/* Submission Tab */}
              <TabsContent value="submission" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Enviar Solicitação</CardTitle>
                    <CardDescription>
                      Insira o conteúdo do e-mail ou faça upload de um arquivo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Input Method Selection */}
                    <div className="flex space-x-4">
                      <Button
                        variant={inputMethod === 'text' ? 'default' : 'outline'}
                        onClick={() => setInputMethod('text')}
                        className="flex-1 cursor-pointer"
                      >
                        Texto
                      </Button>
                      <Button
                        variant={inputMethod === 'file' ? 'default' : 'outline'}
                        onClick={() => setInputMethod('file')}
                        className="flex-1 cursor-pointer"
                      >
                        Upload de Arquivo
                      </Button>
                    </div>

                    {/* Text Input */}
                    {inputMethod === 'text' && (
                      <div className="space-y-2">
                        <Label htmlFor="email-text">Conteúdo do E-mail</Label>
                        <Textarea
                          id="email-text"
                          placeholder="Digite o conteúdo do e-mail que deseja processar..."
                          value={emailText}
                          onChange={(e) => setEmailText(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </div>
                    )}

                    {/* File Upload */}
                    {inputMethod === 'file' && (
                      <div className="space-y-2">
                        <Label htmlFor="file-upload">Upload de Arquivo</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Input
                            id="file-upload"
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".txt,.pdf"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              {uploadedFile ? uploadedFile.name : 'Clique para selecionar um arquivo'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Formatos aceitos: TXT, PDF
                            </p>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      onClick={handleSubmit}
                      disabled={isLoading || (inputMethod === 'text' && !emailText.trim()) || (inputMethod === 'file' && !uploadedFile)}
                      className="w-full cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Gerar E-mail'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Result Tab */}
              <TabsContent value="result" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resultado Gerado</CardTitle>
                    <CardDescription>
                      E-mail processado pela IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
                          <p className="text-gray-600">Processando com IA...</p>
                        </div>
                      </div>
                    ) : result ? (
                      <div className="space-y-6">
                        {/* Classification */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Classificação:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.classification === 'Produtivo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.classification}
                          </span>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Assunto</Label>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">{result.subject}</p>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Corpo do E-mail</Label>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <pre className="text-sm whitespace-pre-wrap font-sans">{result.body}</pre>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <Button onClick={copyToClipboard} variant="outline" className="flex-1 cursor-pointer">
                            <Copy className="w-4 h-4 mr-2 " />
                            Copiar Conteúdo
                          </Button>
                          <Button className="flex-1 cursor-pointer" onClick={sendEmail}>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar por E-mail
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum resultado ainda. Faça uma submissão primeiro.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Toaster position="bottom-center" richColors />
    </div>
  )
}

export default App

