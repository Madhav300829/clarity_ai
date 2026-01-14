

import React, { useState, FC, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { InputField } from './ui/InputField';
import { editImage } from '../services/geminiService';
import { SpinnerIcon } from './icons/Icons';
import { useTranslation } from '../context/LanguageContext';

interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string; // base64 string with mime type prefix
    onSave: (newImageSrc: string) => void;
}

export const ImageEditorModal: FC<ImageEditorModalProps> = ({ isOpen, onClose, imageSrc, onSave }) => {
    const [prompt, setPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedImageSrc, setEditedImageSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            setEditedImageSrc(null);
            setPrompt('');
            setError(null);
        }
    }, [isOpen]);

    const handleEdit = async () => {
        if (!prompt.trim()) return;
        setIsEditing(true);
        setError(null);
        try {
            const [prefix, base64Data] = imageSrc.split(',');
            const mimeType = prefix.match(/:(.*?);/)?.[1] || 'image/png';
            
            const result = await editImage(base64Data, mimeType, prompt);
            if (result) {
                setEditedImageSrc(`data:${mimeType};base64,${result}`);
            } else {
                setError(t('imageEditor.error.process'));
            }
        } catch (e) {
            console.error(e);
            setError(t('imageEditor.error.general'));
        } finally {
            setIsEditing(false);
        }
    };
    
    const handleSave = () => {
        if (editedImageSrc) {
            onSave(editedImageSrc);
        }
        onClose();
    }

    const currentImage = editedImageSrc || imageSrc;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('imageEditor.title')}>
            <div className="space-y-4">
                <div className="relative border border-slate-200 dark:border-slate-600 rounded-lg p-2 flex justify-center items-center bg-slate-100 dark:bg-slate-900 min-h-[200px]">
                    <img src={currentImage} alt={t('imageEditor.imagePreviewAlt')} className="max-w-full max-h-64 object-contain rounded" />
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center rounded-lg">
                            <SpinnerIcon className="h-8 w-8 text-white" />
                            <p className="text-white mt-2">{t('imageEditor.editing')}</p>
                        </div>
                    )}
                </div>
                
                {error && <p className="text-sm text-rose-500">{error}</p>}
                
                <InputField 
                    id="edit-prompt"
                    label={t('imageEditor.instruction.label')}
                    placeholder={t('imageEditor.instruction.placeholder')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isEditing}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button onClick={handleEdit} isLoading={isEditing}>{t('imageEditor.applyEdit')}</Button>
                    <Button onClick={handleSave} disabled={!editedImageSrc}>{t('imageEditor.saveImage')}</Button>
                </div>
            </div>
        </Modal>
    );
};