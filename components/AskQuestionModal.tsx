

import React, { useState, FC, ChangeEvent } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { InputField } from './ui/InputField';
import { PhotoIcon } from './icons/Icons';
import { ImageEditorModal } from './ImageEditorModal';
import { useTranslation } from '../context/LanguageContext';

interface AskQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; imageUrl?: string }) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const AskQuestionModal: FC<AskQuestionModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const { t } = useTranslation();
    
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setImageBase64(base64);
        }
    };

    const handleSubmit = () => {
        if (!title.trim()) return;
        onSubmit({
            title,
            description,
            imageUrl: imageBase64 || undefined
        });
        // Reset state and close
        setTitle('');
        setDescription('');
        setImageBase64(null);
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={t('askQuestionModal.title')}>
                <div className="space-y-4">
                    <InputField 
                        id="question-title"
                        label={t('askQuestionModal.question.label')}
                        placeholder={t('askQuestionModal.question.placeholder')}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div>
                        <label htmlFor="question-description" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{t('askQuestionModal.description.label')}</label>
                        <textarea 
                            id="question-description" 
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 bg-primary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary"
                            placeholder={t('askQuestionModal.description.placeholder')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{t('askQuestionModal.image.label')}</label>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-6 py-10">
                            <div className="text-center">
                                {imageBase64 ? (
                                    <div className="relative group">
                                        <img src={imageBase64} alt="Preview" className="mx-auto h-32 w-auto rounded" />
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                             <Button variant="secondary" onClick={() => setIsEditorOpen(true)}>{t('askQuestionModal.editImage')}</Button>
                                             <button onClick={() => setImageBase64(null)} className="mt-2 text-xs text-rose-400 hover:underline">{t('askQuestionModal.remove')}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                                        <div className="mt-4 flex text-sm leading-6 text-slate-500">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 hover:text-green-600">
                                                <span>{t('askQuestionModal.uploadFile')}</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                            <p className="pl-1">{t('askQuestionModal.dragAndDrop')}</p>
                                        </div>
                                        <p className="text-xs leading-5 text-slate-400">{t('askQuestionModal.fileTypes')}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
                        <Button onClick={handleSubmit}>{t('askQuestionModal.postQuestion')}</Button>
                    </div>
                </div>
            </Modal>
            {imageBase64 && (
                <ImageEditorModal 
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    imageSrc={imageBase64}
                    onSave={(newImage) => {
                        setImageBase64(newImage);
                        setIsEditorOpen(false);
                    }}
                />
            )}
        </>
    );
};