import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchDocuments } from '@/lib/api';
import { Link } from 'wouter';
import { ChatPanel } from '@/components/chat/chat-panel';
import { useChat } from '@/context/chat-context';
import { PdfGenerator } from '@/components/documents/pdf-generator';

function DocumentsList() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: fetchDocuments,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new financial document.
        </p>
        <div className="mt-6">
          <Link href="/documents/income-statement">
            <Button>Create document</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(doc.createdAt)} • {doc.documentType.replace('_', ' ')}
                </p>
              </div>
              <div className="space-x-2">
                <Link href={`/documents/${doc.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
                <PdfGenerator 
                  documentId={doc.id} 
                  documentType={doc.documentType} 
                  documentTitle={doc.title} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Documents() {
  const { isChatOpen, toggleChat } = useChat();
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
              <div className="flex space-x-2">
                <Link href="/documents/income-statement">
                  <Button>
                    <svg
                      className="h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    New Document
                  </Button>
                </Link>
                <Button variant="outline" onClick={toggleChat}>
                  Ask AI
                </Button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="income-statements">Income Statements</TabsTrigger>
                <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
                <TabsTrigger value="audit">Audit Documents</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <DocumentsList />
              </TabsContent>
              <TabsContent value="income-statements">
                <DocumentsList />
              </TabsContent>
              <TabsContent value="cash-flow">
                <DocumentsList />
              </TabsContent>
              <TabsContent value="audit">
                <DocumentsList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
}
