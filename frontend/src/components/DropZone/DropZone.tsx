"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileArchive, X, AlertCircle } from "lucide-react";
import styles from "./DropZone.module.css";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  maxSize?: number; // in MB
}

export default function DropZone({ 
  onFileSelect, 
  isLoading = false,
  maxSize = 10 
}: DropZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError("Invalid file type. Please upload a ZIP file.");
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSize}MB.`);
        return;
      }
      
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className={styles.container}>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ""} ${
          isLoading ? styles.disabled : ""
        } ${error ? styles.error : ""}`}
      >
        <input {...getInputProps()} />
        
        {selectedFile && !error ? (
          <div className={styles.filePreview}>
            <div className={styles.fileIcon}>
              <FileArchive size={48} />
            </div>
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{selectedFile.name}</span>
              <span className={styles.fileSize}>
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
            {!isLoading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className={styles.removeButton}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.uploadIcon}>
              <Upload size={40} />
            </div>
            <div className={styles.text}>
              {isDragActive ? (
                <p className={styles.primary}>Drop your ZIP file here</p>
              ) : (
                <>
                  <p className={styles.primary}>
                    Drag & drop your smart contract ZIP
                  </p>
                  <p className={styles.secondary}>
                    or click to browse files (max {maxSize}MB)
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className="spinner" />
            <span>Analyzing contracts...</span>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
