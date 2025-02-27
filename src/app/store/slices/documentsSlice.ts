import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, addDoc, serverTimestamp, Timestamp, FieldValue, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../services/firebase';

// Document interface
export interface Document {
  id: string;
  fileName: string;
  downloadURL: string;
  docType: string;
  createdAt?: Timestamp | string;
}

// Firestore document interface (separate from the client-side Document interface)
interface FirestoreDocument {
  fileName: string;
  downloadURL: string;
  docType: string;
  userId: string;
  createdAt: FieldValue;
}

// Upload state tracking
export interface UploadProgress {
  fileName: string;
  progress: number;
  completed: boolean;
  downloadURL: string;
  error: string | null;
}

// State definition
interface DocumentsState {
  items: Document[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentUpload: UploadProgress | null;
}

// Initial state
const initialState: DocumentsState = {
  items: [],
  status: 'idle',
  error: null,
  currentUpload: null,
};

// Helper function to convert a Firestore timestamp to a serializable value
const serializeTimestamp = (timestamp: Timestamp | undefined): string | undefined => {
  if (!timestamp) return undefined;
  // Convert to milliseconds since epoch
  return timestamp.toDate().toISOString();
};

// Helper function to convert documents with timestamps to serializable documents
const serializeDocument = (doc: {
  id: string;
  fileName: string;
  downloadURL: string;
  docType: string;
  createdAt?: Timestamp;
}): Document => {
  return {
    id: doc.id,
    fileName: doc.fileName,
    downloadURL: doc.downloadURL,
    docType: doc.docType || "",
    // Convert timestamp to serializable format
    createdAt: doc.createdAt ? serializeTimestamp(doc.createdAt) : undefined,
  };
};

// Helper function to create a Document object with proper typing
const createDocumentObject = (id: string, fileName: string, downloadURL: string, docType: string): Document => {
  return {
    id,
    fileName,
    downloadURL,
    docType,
    createdAt: new Date().toISOString()
  };
};

// Async thunk to fetch documents
export const fetchUserDocuments = createAsyncThunk(
  'documents/fetchUserDocuments',
  async (userId: string, { dispatch }) => {
    // Updated to query the documents collection and filter by userId
    const documentsRef = collection(db, "documents");
    const q = query(
      documentsRef, 
      // Filter documents by userId
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    // We use onSnapshot which returns an unsubscribe function
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userDocs: Document[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userDocs.push(serializeDocument({
          id: doc.id,
          fileName: data.fileName,
          downloadURL: data.downloadURL,
          docType: data.docType || "",
          createdAt: data.createdAt,
        }));
      });
      dispatch(documentsReceived(userDocs));
    }, (error) => {
      dispatch(documentsLoadingFailed(error.message));
    });

    // Return the unsubscribe function so we can clean up when needed
    return unsubscribe;
  }
);

// Async thunk to delete a document
export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async ({ document }: { document: Document }, { rejectWithValue }) => {
    try {
      // Get storage path from downloadURL
      const fileUrl = new URL(document.downloadURL);
      const storagePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1].split('?')[0]);
      const storageRef = ref(storage, storagePath);
      
      // Delete from Storage
      try {
        await deleteObject(storageRef);
      } catch (storageError) {
        console.log("Storage file already deleted or not found", storageError);
      }
  
      // Delete from Firestore - updated to use documents collection
      const docRef = doc(db, "documents", document.id);
      await deleteDoc(docRef);
      
      return document.id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Upload document thunk
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async ({ file, docType, userId }: { file: File, docType: string, userId: string }, { dispatch }) => {
    try {
      // Create a unique filename with the user ID
      const timestamp = new Date().getTime();
      const uniqueFileName = `${userId}_${timestamp}_${file.name}`;
      
      // Create storage reference
      const storageRef = ref(storage, `documents/${uniqueFileName}`);
      
      // Initialize upload tracking
      dispatch(setCurrentUpload({
        fileName: file.name,
        progress: 0,
        completed: false,
        downloadURL: '',
        error: null
      }));
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      // return a promise that resolves when the upload is complete
      return new Promise<Document>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Update progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            dispatch(updateUploadProgress(progress));
          },
          (error) => {
            // Handle error
            dispatch(setUploadError(error.message));
            reject(error);
          },
          async () => {
            // Upload complete, get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save document to Firestore
            const firestoreDoc: FirestoreDocument = {
              fileName: file.name,
              downloadURL,
              docType,
              userId,
              createdAt: serverTimestamp()
            };
            const docRef = await addDoc(collection(db, 'documents'), firestoreDoc);
            
            // Mark upload as complete
            dispatch(setUploadComplete({
              downloadURL,
              id: docRef.id
            }));
            
            // Create a properly typed Document object
            const document = createDocumentObject(docRef.id, file.name, downloadURL, docType);
            resolve(document);
          }
        );
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(setUploadError(errorMessage));
      throw error;
    }
  }
);

// Create the documents slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    // Called by the onSnapshot listener to update documents
    documentsReceived(state, action: PayloadAction<Document[]>) {
      state.status = 'succeeded';
      state.items = action.payload;
    },
    // Called when there's an error loading documents
    documentsLoadingFailed(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    // Update the progress of current upload
    updateUploadProgress(state, action: PayloadAction<number>) {
      if (state.currentUpload) {
        state.currentUpload.progress = action.payload;
      }
    },
    // Reset the current upload state
    resetUploadState(state) {
      state.currentUpload = null;
    },
    setCurrentUpload(state, action: PayloadAction<UploadProgress>) {
      state.currentUpload = action.payload;
    },
    setUploadError(state, action: PayloadAction<string>) {
      if (state.currentUpload) {
        state.currentUpload.error = action.payload;
      }
    },
    setUploadComplete(state, action: PayloadAction<{ downloadURL: string; id: string }>) {
      if (state.currentUpload) {
        state.currentUpload.completed = true;
        state.currentUpload.downloadURL = action.payload.downloadURL;
        state.currentUpload.error = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDocuments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { 
  documentsReceived, 
  documentsLoadingFailed, 
  updateUploadProgress,
  resetUploadState,
  setCurrentUpload,
  setUploadError,
  setUploadComplete
} = documentsSlice.actions;

// Export reducer
export default documentsSlice.reducer; 