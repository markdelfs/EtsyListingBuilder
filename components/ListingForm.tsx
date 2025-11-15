
import React, { useState, useCallback } from 'react';
import { useEtsyAuth } from '../hooks/useEtsyAuth';
import * as etsyService from '../services/etsyService';
import { ETSY_COLORS, ETSY_HOLIDAYS } from '../constants';
import type { ListingFormData } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import TagInput from './ui/TagInput';
import Button from './ui/Button';
import Loader from './ui/Loader';

const initialFormData: ListingFormData = {
  title: '',
  description: '',
  primaryColorId: '1', // Default: Black
  secondaryColorId: '10', // Default: White
  holidayId: '1', // Default: Christmas
  tags: [],
  image1: null,
  image2: null,
  productFile: null,
};

interface FilePreviewProps {
  file: File | null;
  onClear: () => void;
  label: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClear, label }) => {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="mt-2 p-2 border rounded-lg relative">
        {previewUrl && (
             <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded" />
        )}
        <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
        </div>
        <button type="button" onClick={onClear} className="absolute top-1 right-1 text-red-500 hover:text-red-700">&times;</button>
    </div>
  );
};

interface ListingFormProps {
    onLogout: () => void;
}

export default function ListingForm({ onLogout }: ListingFormProps): React.ReactElement {
  const { accessToken } = useEtsyAuth();
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleClearFile = (name: keyof ListingFormData) => {
    setFormData(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setStatus({ type: 'error', message: 'Authentication error. Please log in again.' });
      return;
    }
    
    // --- Validation ---
    if (!formData.title || !formData.description || !formData.image1 || !formData.image2 || !formData.productFile) {
      setStatus({ type: 'error', message: 'Please fill all required fields and upload all files.' });
      return;
    }
    if (formData.tags.length === 0 || formData.tags.length > 13) {
      setStatus({ type: 'error', message: 'Please provide between 1 and 13 tags.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Starting process...' });

    try {
      setStatus({ type: 'loading', message: 'Fetching your shop information...' });
      const me = await etsyService.getMe(accessToken);
      if (!me.shop_id) {
          throw new Error("Could not find a shop associated with your account.");
      }
      
      setStatus({ type: 'loading', message: 'Creating draft listing...' });
      const listingResponse = await etsyService.createListing(me.shop_id, formData, accessToken);
      const listingId = listingResponse.listing_id;

      setStatus({ type: 'loading', message: 'Uploading preview image 1...' });
      await etsyService.uploadImage(listingId, formData.image1, 1, accessToken);

      setStatus({ type: 'loading', message: 'Uploading preview image 2...' });
      await etsyService.uploadImage(listingId, formData.image2, 2, accessToken);

      setStatus({ type: 'loading', message: 'Uploading product ZIP file...' });
      await etsyService.uploadFile(listingId, formData.productFile, accessToken);

      setStatus({ type: 'success', message: `Successfully created draft listing! Listing ID: ${listingId}` });
      setFormData(initialFormData); // Reset form
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes("401") || errorMessage.includes("token")) {
          setStatus({ type: 'error', message: 'Your session has expired. Please log out and log in again.' });
          onLogout();
      } else {
        setStatus({ type: 'error', message: `Failed to create listing: ${errorMessage}` });
      }
    }
  }, [accessToken, formData, onLogout]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 shadow-lg rounded-lg max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <Input label="Title" name="title" value={formData.title} onChange={handleInputChange} required />
        </div>
        <div className="sm:col-span-6">
          <Textarea label="Description" name="description" value={formData.description} onChange={handleInputChange} rows={5} required />
        </div>
        <div className="sm:col-span-3">
          <Select label="Primary Color" name="primaryColorId" value={formData.primaryColorId} onChange={handleInputChange} options={ETSY_COLORS} />
        </div>
        <div className="sm:col-span-3">
          <Select label="Secondary Color" name="secondaryColorId" value={formData.secondaryColorId} onChange={handleInputChange} options={ETSY_COLORS} />
        </div>
        <div className="sm:col-span-3">
          <Select label="Holiday" name="holidayId" value={formData.holidayId} onChange={handleInputChange} options={ETSY_HOLIDAYS} />
        </div>
        <div className="sm:col-span-6">
            <TagInput
                label="Tags (comma-separated, max 13)"
                tags={formData.tags}
                setTags={(newTags) => setFormData(prev => ({...prev, tags: newTags}))}
            />
        </div>
        
        <div className="sm:col-span-2">
            <Input label="Preview Image 1" name="image1" type="file" onChange={handleFileChange} accept="image/*" required />
            <FilePreview file={formData.image1} onClear={() => handleClearFile('image1')} label="Image 1"/>
        </div>
        <div className="sm:col-span-2">
            <Input label="Preview Image 2" name="image2" type="file" onChange={handleFileChange} accept="image/*" required />
            <FilePreview file={formData.image2} onClear={() => handleClearFile('image2')} label="Image 2"/>
        </div>
        <div className="sm:col-span-2">
            <Input label="Product ZIP File" name="productFile" type="file" onChange={handleFileChange} accept=".zip" required />
            <FilePreview file={formData.productFile} onClear={() => handleClearFile('productFile')} label="Product File"/>
        </div>
      </div>
      
      {status.type !== 'idle' && (
        <div className={`p-4 rounded-md text-sm ${
            status.type === 'loading' ? 'bg-blue-100 text-blue-800' :
            status.type === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
        }`}>
            <div className="flex items-center">
                {status.type === 'loading' && <Loader />}
                <p>{status.message}</p>
            </div>
        </div>
      )}

      <div className="pt-5">
        <div className="flex justify-end">
          <Button type="submit" disabled={status.type === 'loading'}>
            {status.type === 'loading' ? 'Creating...' : 'Create Draft Listing'}
          </Button>
        </div>
      </div>
    </form>
  );
}
