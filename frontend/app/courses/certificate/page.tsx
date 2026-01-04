'use client';

import { FC, ReactNode, useRef, useState } from 'react';
import {
    Award, Download, Eye, Share2, Check, X,
    Calendar, Clock, User, BookOpen, Star,
    Shield, Printer, Mail, Copy, ExternalLink
} from 'lucide-react';

// Types
interface Certificate {
    id: string;
    studentName: string;
    courseName: string;
    instructorName: string;
    completionDate: Date;
    grade: string;
    certificateNumber: string;
    verificationUrl: string;
    skills: string[];
    duration: string;
    modules: number;
    score: number;
}

interface CertificateTemplate {
    id: string;
    name: string;
    style: 'modern' | 'classic' | 'minimal' | 'premium';
}

// Mock data
const mockCertificate: Certificate = {
    id: '1',
    studentName: 'John Doe',
    courseName: 'Advanced React Development',
    instructorName: 'Dr. Sarah Johnson',
    completionDate: new Date(),
    grade: 'A+',
    certificateNumber: 'CERT-2024-001234',
    verificationUrl: 'https://platform.edu/verify/CERT-2024-001234',
    skills: ['React', 'Redux', 'TypeScript', 'Next.js'],
    duration: '8 weeks',
    modules: 12,
    score: 95
};

export default function CertificateGeneration() {
    const [certificate, setCertificate] = useState<Certificate>(mockCertificate);
    const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>({
        id: '1',
        name: 'Modern',
        style: 'modern'
    });
    const [generating, setGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    const templates: CertificateTemplate[] = [
        { id: '1', name: 'Modern', style: 'modern' },
        { id: '2', name: 'Classic', style: 'classic' },
        { id: '3', name: 'Minimal', style: 'minimal' },
        { id: '4', name: 'Premium', style: 'premium' }
    ];

    const handleGenerateCertificate = async () => {
        setGenerating(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGenerating(false);
        setShowPreview(true);
    };

    const handleDownloadPDF = () => {
        // In a real app, this would generate and download a PDF
        alert('Downloading certificate as PDF...');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = (method: string) => {
        switch(method) {
            case 'email':
                window.location.href = `mailto:?subject=Course Certificate&body=I completed ${certificate.courseName}! View my certificate: ${certificate.verificationUrl}`;
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${certificate.verificationUrl}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(certificate.verificationUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                break;
        }
    };

    // Certificate Template components
    const ModernCertificate = () => (
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-12 rounded-lg shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            <div className="text-center space-y-6">
                <div className="flex justify-center mb-4">
                    <Award className="w-20 h-20 text-yellow-500" />
                </div>

                <h1 className="text-4xl font-bold text-gray-800">Certificate of Completion</h1>

                <div className="space-y-2">
                    <p className="text-gray-600">This is to certify that</p>
                    <h2 className="text-3xl font-bold text-blue-600">{certificate.studentName}</h2>
                </div>

                <div className="space-y-2">
                    <p className="text-gray-600">has successfully completed the course</p>
                    <h3 className="text-2xl font-semibold text-gray-800">{certificate.courseName}</h3>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-8">
                    <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-800">{certificate.duration}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Modules</p>
                        <p className="font-semibold text-gray-800">{certificate.modules}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Score</p>
                        <p className="font-semibold text-gray-800">{certificate.score}%</p>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-300">
                    <div className="text-left">
                        <p className="text-sm text-gray-600">Instructor</p>
                        <p className="font-semibold text-gray-800">{certificate.instructorName}</p>
                    </div>

                    <div className="text-center">
                        <div className="w-32 h-32 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                            <Shield className="w-16 h-16 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Official Seal</p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold text-gray-800">
                            {certificate.completionDate.toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-300">
                    <p className="text-xs text-gray-500">Certificate ID: {certificate.certificateNumber}</p>
                    <p className="text-xs text-gray-500">Verify at: {certificate.verificationUrl}</p>
                </div>
            </div>
        </div>
    );

    const ClassicCertificate = () => (
        <div className="relative bg-white p-16 rounded-lg shadow-2xl border-8 border-double border-gray-800">
            <div className="text-center space-y-6">
                <div className="text-6xl font-serif text-gray-800 mb-8">Certificate of Achievement</div>

                <div className="space-y-4">
                    <p className="text-xl text-gray-700 font-serif">This certifies that</p>
                    <div className="text-4xl font-bold text-gray-900 font-serif py-2 border-b-2 border-gray-800 inline-block">
                        {certificate.studentName}
                    </div>
                </div>

                <div className="space-y-4 my-8">
                    <p className="text-xl text-gray-700 font-serif">has successfully completed</p>
                    <div className="text-3xl font-bold text-gray-900 font-serif">{certificate.courseName}</div>
                </div>

                <div className="flex justify-around mt-16">
                    <div className="text-center">
                        <div className="border-t-2 border-gray-800 w-48 mb-2"></div>
                        <p className="text-gray-700 font-serif">{certificate.instructorName}</p>
                        <p className="text-sm text-gray-600 font-serif">Instructor</p>
                    </div>

                    <div className="text-center">
                        <div className="border-t-2 border-gray-800 w-48 mb-2"></div>
                        <p className="text-gray-700 font-serif">{certificate.completionDate.toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600 font-serif">Date of Completion</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const MinimalCertificate = () => (
        <div className="bg-white p-12 rounded-lg shadow-lg">
            <div className="space-y-8">
                <div className="border-b pb-4">
                    <h1 className="text-2xl font-light text-gray-800">CERTIFICATE</h1>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-gray-600 uppercase tracking-wider">Student</p>
                        <p className="text-2xl font-medium text-gray-900">{certificate.studentName}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 uppercase tracking-wider">Course</p>
                        <p className="text-xl text-gray-900">{certificate.courseName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm text-gray-600 uppercase tracking-wider">Grade</p>
                            <p className="text-lg font-medium text-gray-900">{certificate.grade}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 uppercase tracking-wider">Date</p>
                            <p className="text-lg text-gray-900">{certificate.completionDate.toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <p className="text-xs text-gray-500">{certificate.certificateNumber}</p>
                </div>
            </div>
        </div>
    );

    const PremiumCertificate = () => (
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-12 rounded-lg shadow-2xl text-white">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>

            <div className="text-center space-y-6">
                <Award className="w-24 h-24 text-yellow-400 mx-auto mb-4" />

                <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Certificate of Excellence
                </h1>

                <div className="space-y-3">
                    <p className="text-gray-400">Awarded to</p>
                    <h2 className="text-4xl font-bold">{certificate.studentName}</h2>
                </div>

                <div className="space-y-3">
                    <p className="text-gray-400">For outstanding completion of</p>
                    <h3 className="text-2xl font-semibold text-yellow-400">{certificate.courseName}</h3>
                </div>

                <div className="flex justify-center gap-2 my-6">
                    {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
                    ))}
                </div>

                <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-700">
                    <div>
                        <p className="text-sm text-gray-400">Score</p>
                        <p className="text-xl font-bold text-yellow-400">{certificate.score}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Grade</p>
                        <p className="text-xl font-bold text-yellow-400">{certificate.grade}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Duration</p>
                        <p className="text-xl font-bold">{certificate.duration}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Modules</p>
                        <p className="text-xl font-bold">{certificate.modules}</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="text-left">
                            <p className="text-sm text-gray-400">Instructor</p>
                            <p className="font-semibold">{certificate.instructorName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Issued on</p>
                            <p className="font-semibold">{certificate.completionDate.toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-gray-500">
                    Certificate ID: {certificate.certificateNumber} | Verify: {certificate.verificationUrl}
                </div>
            </div>
        </div>
    );

    const renderCertificate = () => {
        switch(selectedTemplate.style) {
            case 'classic':
                return <ClassicCertificate />;
            case 'minimal':
                return <MinimalCertificate />;
            case 'premium':
                return <PremiumCertificate />;
            default:
                return <ModernCertificate />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Certificate Generation</h1>
                    <p className="text-gray-400">Generate and customize course completion certificates</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Certificate Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* courses Info */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Course Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-400">Course Name</p>
                                    <p className="text-white font-medium">{certificate.courseName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Student Name</p>
                                    <p className="text-white font-medium">{certificate.studentName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Completion Date</p>
                                    <p className="text-white">{certificate.completionDate.toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Final Score</p>
                                    <p className="text-white">{certificate.score}% ({certificate.grade})</p>
                                </div>
                            </div>
                        </div>

                        {/* Template Selection */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Certificate Template</h3>
                            <div className="space-y-2">
                                {templates.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={`w-full p-3 rounded-lg text-left transition-all ${
                                            selectedTemplate.id === template.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        <p className="font-medium">{template.name}</p>
                                        <p className="text-sm opacity-80">
                                            {template.style === 'modern' && 'Clean and contemporary design'}
                                            {template.style === 'classic' && 'Traditional academic style'}
                                            {template.style === 'minimal' && 'Simple and elegant'}
                                            {template.style === 'premium' && 'Luxurious dark theme'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleGenerateCertificate}
                                    disabled={generating}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {generating ? (
                                        <>Generating...</>
                                    ) : (
                                        <>
                                            <Award className="w-5 h-5" />
                                            Generate Certificate
                                        </>
                                    )}
                                </button>

                                {showPreview && (
                                    <>
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download PDF
                                        </button>

                                        <button
                                            onClick={handlePrint}
                                            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Printer className="w-5 h-5" />
                                            Print Certificate
                                        </button>

                                        <button
                                            onClick={() => setShowShareModal(true)}
                                            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Share2 className="w-5 h-5" />
                                            Share Certificate
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certificate Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Certificate Preview</h3>
                                <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                  Ready to Generate
                </span>
                            </div>

                            <div className="bg-white rounded-lg p-4 overflow-auto">
                                <div className="transform scale-75 origin-top-left" style={{ width: '133.33%' }}>
                                    <div ref={certificateRef}>
                                        {renderCertificate()}
                                    </div>
                                </div>
                            </div>

                            {/* Verification Info */}
                            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-sm">Blockchain Verified</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            This certificate will be permanently stored and verifiable via unique ID
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <code className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                                                {certificate.certificateNumber}
                                            </code>
                                            <button
                                                onClick={() => handleShare('copy')}
                                                className="text-blue-400 hover:text-blue-300"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Modal */}
                {showShareModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full">
                            <h3 className="text-xl font-semibold text-white mb-4">Share Certificate</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleShare('email')}
                                    className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center gap-3 transition-colors"
                                >
                                    <Mail className="w-5 h-5" />
                                    Share via Email
                                </button>

                                <button
                                    onClick={() => handleShare('linkedin')}
                                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-3 transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Share on LinkedIn
                                </button>

                                <div className="p-3 bg-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-2">Certificate URL</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={certificate.verificationUrl}
                                            readOnly
                                            className="flex-1 bg-gray-800 px-3 py-2 rounded text-gray-300 text-sm"
                                        />
                                        <button
                                            onClick={() => handleShare('copy')}
                                            className={`px-3 py-2 rounded transition-colors ${
                                                copied ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                            }`}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowShareModal(false)}
                                className="w-full mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

