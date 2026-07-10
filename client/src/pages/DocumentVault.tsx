import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth, API_URL } from "../lib/api";
import { FolderLock, UploadCloud, File, FileText, FileImage, Trash2, Download } from "lucide-react";

export const DocumentVault = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => fetchWithAuth("/documents", getToken),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadError("");
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", getFileType(file.name));

      const res = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsUploading(false);
    },
    onError: (err: any) => {
      setUploadError(err.message);
      setIsUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/documents/${id}`, getToken, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'TAX_RETURN': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'IDENTITY': return <FileImage className="w-8 h-8 text-emerald-500" />;
      case 'STATEMENT': return <FileText className="w-8 h-8 text-amber-500" />;
      default: return <File className="w-8 h-8 text-zinc-500" />;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-400 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FolderLock className="w-8 h-8 text-emerald-500" /> Document Vault
          </h1>
          <p className="text-zinc-400 mt-1">Securely store your sensitive financial documents.</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div> : <UploadCloud className="w-4 h-4" />}
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </header>

      {uploadError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/50 rounded-lg text-rose-500 text-sm">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {documents.map((doc: any) => (
          <div key={doc.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 group hover:border-zinc-700 transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-black rounded-xl border border-zinc-800">
                {getFileIcon(doc.type)}
              </div>
              <button onClick={() => deleteMutation.mutate(doc.id)} className="text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-semibold text-white truncate text-sm" title={doc.name}>{doc.name}</h3>
            <div className="flex justify-between items-end mt-4">
              <p className="text-xs text-zinc-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
              <a 
                href={`${API_URL.replace(/\/api$/, '')}${doc.url}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-500 hover:text-emerald-400 p-1 bg-emerald-500/10 rounded"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}

        {documents.length === 0 && !isUploading && (
          <div className="col-span-full py-16 text-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl flex flex-col items-center">
            <FolderLock className="w-16 h-16 text-zinc-600 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-400 mb-2">Your vault is empty</h3>
            <p className="text-zinc-500 max-w-md mx-auto mb-6">
              Upload tax returns, bank statements, and identification documents securely. Your files are encrypted and accessible only to you.
            </p>
            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors flex items-center gap-2">
              <UploadCloud className="w-5 h-5" /> Select File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function getFileType(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.includes('tax') || lower.includes('itr') || lower.includes('w2')) return 'TAX_RETURN';
  if (lower.includes('statement') || lower.includes('bank')) return 'STATEMENT';
  if (lower.includes('pan') || lower.includes('aadhaar') || lower.includes('passport') || lower.includes('id')) return 'IDENTITY';
  return 'OTHER';
}
