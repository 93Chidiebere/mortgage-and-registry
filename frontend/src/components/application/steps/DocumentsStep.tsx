import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ApplicationFormData } from '../ApplicationWizard';
import type { Document } from '@/types/mortgage';

interface DocumentsStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface DocumentRequirement {
  type: Document['type'];
  label: string;
  description: string;
  required: boolean;
  acceptedFormats: string;
}

const documentRequirements: DocumentRequirement[] = [
  {
    type: 'id',
    label: 'Government-Issued ID',
    description: 'National ID, International Passport, or Driver\'s License',
    required: true,
    acceptedFormats: 'PDF, JPG, PNG',
  },

  {
    type: 'bank_statement',
    label: 'Bank Statements',
    description: 'Last 6 months statements from your primary bank',
    required: true,
    acceptedFormats: 'PDF',
  },

  {
    type: 'property_doc',
    label: 'Property Documents',
    description: 'Sale agreement, property title, or allocation letter',
    required: false,
    acceptedFormats: 'PDF',
  },
  {
    type: 'other',
    label: 'Other Supporting Documents',
    description: 'Any additional documents that support your application',
    required: false,
    acceptedFormats: 'PDF, JPG, PNG',
  },
];

export function DocumentsStep({ formData, updateFormData, onNext, onPrev }: DocumentsStepProps) {
  const [documents, setDocuments] = useState<Document[]>(formData.documents || []);
  const [uploadingType, setUploadingType] = useState<Document['type'] | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = useCallback(async (type: Document['type'], files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingType(type);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(progressInterval);
    setUploadProgress(100);

    const newDocs: Document[] = Array.from(files).map((file, index) => ({
      id: `doc-${Date.now()}-${index}`,
      name: file.name,
      type,
      url: URL.createObjectURL(file), // In real app, this would be the uploaded URL
      verified: false,
      uploadedAt: new Date(),
    }));

    setDocuments(prev => {
      const updated = [...prev.filter(d => d.type !== type), ...newDocs];
      updateFormData({ documents: updated });
      return updated;
    });

    setTimeout(() => {
      setUploadingType(null);
      setUploadProgress(0);
    }, 500);
  }, [updateFormData]);

  const removeDocument = (docId: string) => {
    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== docId);
      updateFormData({ documents: updated });
      return updated;
    });
  };

  const getDocumentsByType = (type: Document['type']) => {
    return documents.filter(d => d.type === type);
  };

  const requiredDocsMissing = documentRequirements
    .filter(req => req.required)
    .filter(req => getDocumentsByType(req.type).length === 0);

  const canProceed = requiredDocsMissing.length === 0;

  const handleContinue = () => {
    if (canProceed) {
      onNext();
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <File className="w-5 h-5 text-primary" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload the required documents. These will be stored securely and shared with your selected lenders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documentRequirements.map((req) => {
            const uploadedDocs = getDocumentsByType(req.type);
            const isUploading = uploadingType === req.type;
            const hasDocument = uploadedDocs.length > 0;

            return (
              <div
                key={req.type}
                className={cn(
                  "border rounded-xl p-4 transition-all",
                  hasDocument ? "border-primary/30 bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{req.label}</h4>
                      {req.required && (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                      {hasDocument && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                    <p className="text-xs text-muted-foreground">Formats: {req.acceptedFormats}</p>
                  </div>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept={req.acceptedFormats.toLowerCase().split(', ').map(f => `.${f}`).join(',')}
                      multiple
                      onChange={(e) => handleFileUpload(req.type, e.target.files)}
                      disabled={isUploading}
                    />
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      hasDocument
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}>
                      <Upload className="w-4 h-4" />
                      {hasDocument ? 'Replace' : 'Upload'}
                    </div>
                  </label>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1" />
                  </div>
                )}

                {/* Uploaded Files */}
                {uploadedDocs.length > 0 && !isUploading && (
                  <div className="mt-4 space-y-2">
                    {uploadedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between bg-background rounded-lg p-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{doc.name}</span>
                        </div>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="p-1 hover:bg-destructive/10 rounded text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Missing Documents Warning */}
        {requiredDocsMissing.length > 0 && (
          <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">Missing Required Documents</p>
                <p className="text-xs text-amber-600 mt-1">
                  Please upload: {requiredDocsMissing.map(r => r.label).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Documents Uploaded</span>
            <span className="text-sm font-medium">
              {documents.length} of {documentRequirements.filter(r => r.required).length} required
            </span>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button 
            type="button" 
            onClick={handleContinue}
            disabled={!canProceed}
            className="gap-2"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
