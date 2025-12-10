'use client';

import React, { FormEvent, useState } from 'react';
import emailjs from '@emailjs/browser';
import { useTranslations } from 'next-intl';
import { motion, useAnimate } from 'framer-motion';

// Initialize EmailJS configuration from environment variables
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';

// Initialize EmailJS on component mount
if (typeof window !== 'undefined' && EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

interface FormData {
    name: string;
    email: string;
    content: string;
}

interface FormStatus {
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
}

const Loader = () => {
    return (
        <motion.svg
            animate={{
                rotate: [0, 360],
            }}
            initial={{
                scale: 0,
                width: 0,
                display: "none",
            }}
            style={{
                scale: 0.5,
                display: "none",
            }}
            transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: "linear",
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="loader text-white"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3a9 9 0 1 0 9 9" />
        </motion.svg>
    );
};

const CheckIcon = () => {
    return (
        <motion.svg
            initial={{
                scale: 0,
                width: 0,
                display: "none",
            }}
            style={{
                scale: 0.5,
                display: "none",
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check text-white"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M9 12l2 2l4 -4" />
        </motion.svg>
    );
};

const ContactForm: React.FC = () => {
    const t = useTranslations('contact');
    const [scope, animate] = useAnimate();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        content: '',
    });

    const [status, setStatus] = useState<FormStatus>({ type: 'idle' });
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('form.validation.nameRequired');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('form.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('form.validation.emailInvalid');
        }

        if (!formData.content.trim()) {
            newErrors.content = t('form.validation.contentRequired');
        } else if (formData.content.trim().length < 10) {
            newErrors.content = t('form.validation.contentTooShort');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const animateLoading = async () => {
        await animate(
            ".loader",
            {
                width: "20px",
                scale: 1,
                display: "block",
            },
            {
                duration: 0.2,
            },
        );
    };

    const animateSuccess = async () => {
        await animate(
            ".loader",
            {
                width: "0px",
                scale: 0,
                display: "none",
            },
            {
                duration: 0.2,
            },
        );
        await animate(
            ".check",
            {
                width: "20px",
                scale: 1,
                display: "block",
            },
            {
                duration: 0.2,
            },
        );

        await animate(
            ".check",
            {
                width: "0px",
                scale: 0,
                display: "none",
            },
            {
                delay: 2,
                duration: 0.2,
            },
        );
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setStatus({ type: 'loading' });
        await animateLoading();

        try {
            // Check if EmailJS is properly configured
            if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
                console.error('EmailJS configuration is missing. Please set the required environment variables.');
                setStatus({
                    type: 'error',
                    message: 'Email configuration is not set up. Please contact the admin.',
                });
                return;
            }

            // Send email through EmailJS
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    to_email: process.env.NEXT_PUBLIC_RECIPIENT_EMAIL || '',
                    from_name: formData.name,
                    from_email: formData.email,
                    message: formData.content,
                },
                EMAILJS_PUBLIC_KEY
            );

            setStatus({
                type: 'success',
                message: t('form.successMessage'),
            });

            // Reset form
            setFormData({ name: '', email: '', content: '' });
            setErrors({});

            // Show success animation
            await animateSuccess();

            // Clear success message
            setStatus({ type: 'idle' });
        } catch (error) {
            console.error('Failed to send email:', error);
            setStatus({
                type: 'error',
                message: t('form.errorMessage'),
            });

            // Reset loading animation
            await animate(
                ".loader",
                {
                    width: "0px",
                    scale: 0,
                    display: "none",
                },
                {
                    duration: 0.2,
                },
            );

            // Clear error message after 5 seconds
            setTimeout(() => {
                setStatus({ type: 'idle' });
            }, 5000);
        }
    };

    return (
        <div className="w-full bg-white/5 backdrop-blur-xs rounded-3xl sm:rounded-4xl p-4 sm:p-8 border border-white/20 shadow-2xl scroll-animate scroll-fade-up scroll-delay-200">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Name Field */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-md pl-1 sm:pl-0 font-bold text-white mb-2"
                        >
                            {t('form.name')}
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('form.namePlaceholder')}
                            className={`w-full px-4 py-2 rounded-xl sm:rounded-lg bg-white/10 border backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.name ? 'border-red-500' : 'border-white/20'
                                }`}
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-md pl-1 sm:pl-0 font-bold text-white mb-2"
                        >
                            {t('form.email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('form.emailPlaceholder')}
                            className={`w-full px-4 py-2 rounded-xl sm:rounded-lg bg-white/10 border backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.email ? 'border-red-500' : 'border-white/20'
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>
                </div>

                {/* Content Field */}
                <div>
                    <label
                        htmlFor="content"
                        className="block text-md pl-1 sm:pl-0 font-bold text-white mb-2"
                    >
                        {t('form.content')}
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder={t('form.contentPlaceholder')}
                        rows={8}
                        className={`w-full px-4 py-2 rounded-xl sm:rounded-lg bg-white/10 border backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y transition-all ${errors.content ? 'border-red-500' : 'border-white/20'
                            }`}
                    />
                    {errors.content && (
                        <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                    )}
                </div>

                {/* Error Messages */}
                {status.type === 'error' && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                        ✗ {status.message}
                    </div>
                )}

                {/* Submit Button with Loader and Check Animation */}
                <motion.button
                    ref={scope}
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl sm:rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
                >
                    <div className="flex items-center gap-2">
                        <Loader />
                        <CheckIcon />
                        <span>{status.type === 'loading' ? t('form.sending') : t('form.send')}</span>
                    </div>
                </motion.button>
            </form>
        </div>
    );
};

export default ContactForm;
